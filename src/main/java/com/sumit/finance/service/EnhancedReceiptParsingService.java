package com.sumit.finance.service;

import com.sumit.finance.dto.TransactionRequest;
import lombok.extern.slf4j.Slf4j;
import net.sourceforge.tess4j.Tesseract;
import net.sourceforge.tess4j.TesseractException;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.IOException;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
@Slf4j
public class EnhancedReceiptParsingService {

    private final Tesseract tesseract;
    
    // Enhanced patterns for better extraction
    private static final Pattern AMOUNT_PATTERNS = Pattern.compile(
        "\\$?([0-9]{1,3}(?:,[0-9]{3})*\\.[0-9]{2})|" +  // $1,234.56 or 1,234.56
        "\\$?([0-9]+\\.[0-9]{2})|" +                     // $123.45 or 123.45
        "TOTAL\\s*:?\\s*\\$?([0-9]+\\.[0-9]{2})|" +      // TOTAL: $123.45
        "AMOUNT\\s*:?\\s*\\$?([0-9]+\\.[0-9]{2})"        // AMOUNT: $123.45
    );
    
    private static final Pattern DATE_PATTERNS = Pattern.compile(
        "(\\d{1,2})[/-](\\d{1,2})[/-](\\d{2,4})|" +      // MM/DD/YYYY or MM-DD-YYYY
        "(\\d{4})[/-](\\d{1,2})[/-](\\d{1,2})|" +        // YYYY/MM/DD or YYYY-MM-DD
        "(\\d{1,2})\\s+(\\w{3})\\s+(\\d{2,4})"            // DD MMM YYYY
    );
    
    private static final Pattern MERCHANT_PATTERNS = Pattern.compile(
        "^([A-Z][A-Z\\s&.]+(?:STORE|SHOP|MARKET|SUPERMARKET|RESTAURANT|CAFE|PHARMACY|GAS|STATION))|" +
        "^([A-Z][A-Z\\s&.]+)|" +
        "([A-Z][A-Z\\s&.]+)\\s+RECEIPT|" +
        "([A-Z][A-Z\\s&.]+)\\s+INVOICE"
    );

    public EnhancedReceiptParsingService() {
        this.tesseract = new Tesseract();
        this.tesseract.setLanguage("eng");
        // Uncomment and set path when Tesseract is installed
        // this.tesseract.setDatapath("/usr/share/tessdata");
        this.tesseract.setDatapath("C:\\Program Files\\Tesseract-OCR\\tessdata");
    }

    public List<TransactionRequest> parseReceipt(MultipartFile file) throws IOException {
        String contentType = file.getContentType();
        
        if (contentType != null && contentType.startsWith("image/")) {
            return parseImageReceipt(file);
        } else if (contentType != null && contentType.equals("application/pdf")) {
            return parsePdfReceipt(file);
        } else {
            throw new IllegalArgumentException("Unsupported file type. Only images and PDFs are supported.");
        }
    }

    private List<TransactionRequest> parseImageReceipt(MultipartFile file) throws IOException {
        try {
            BufferedImage image = ImageIO.read(file.getInputStream());
            String text = tesseract.doOCR(image);
            log.info("OCR extracted text: {}", text);
            return extractTransactionDetails(text);
        } catch (TesseractException e) {
            log.error("OCR processing failed", e);
            throw new RuntimeException("Failed to process image with OCR", e);
        }
    }

    private List<TransactionRequest> parsePdfReceipt(MultipartFile file) throws IOException {
        try (PDDocument document = PDDocument.load(file.getInputStream())) {
            PDFTextStripper stripper = new PDFTextStripper();
            String text = stripper.getText(document);
            log.info("PDF extracted text: {}", text);
            return extractTransactionDetails(text);
        }
    }

    private List<TransactionRequest> extractTransactionDetails(String text) {
        List<TransactionRequest> transactions = new ArrayList<>();
        
        // Extract amount using multiple patterns
        double amount = extractAmount(text);
        if (amount > 0) {
            // Extract date
            LocalDate date = extractDate(text);
            
            // Extract merchant/description
            String description = extractDescription(text);
            
            // Determine transaction type (usually expense for receipts)
            String type = "EXPENSE";
            
            TransactionRequest transaction = new TransactionRequest();
            transaction.setDescription(description);
            transaction.setAmount(amount);
            transaction.setDate(date);
            transaction.setType(com.sumit.finance.model.TransactionType.valueOf(type));
            
            transactions.add(transaction);
        }
        
        return transactions;
    }

    private double extractAmount(String text) {
        Matcher matcher = AMOUNT_PATTERNS.matcher(text.toUpperCase());
        double maxAmount = 0.0;
        
        while (matcher.find()) {
            for (int i = 1; i <= matcher.groupCount(); i++) {
                String group = matcher.group(i);
                if (group != null) {
                    try {
                        double amount = Double.parseDouble(group.replace(",", ""));
                        if (amount > maxAmount) {
                            maxAmount = amount;
                        }
                    } catch (NumberFormatException e) {
                        log.debug("Failed to parse amount: {}", group);
                    }
                }
            }
        }
        
        return maxAmount;
    }

    private LocalDate extractDate(String text) {
        Matcher matcher = DATE_PATTERNS.matcher(text);
        if (matcher.find()) {
            try {
                int month, day, year;
                
                if (matcher.group(1) != null) {
                    // MM/DD/YYYY format
                    month = Integer.parseInt(matcher.group(1));
                    day = Integer.parseInt(matcher.group(2));
                    year = Integer.parseInt(matcher.group(3));
                } else if (matcher.group(4) != null) {
                    // YYYY/MM/DD format
                    year = Integer.parseInt(matcher.group(4));
                    month = Integer.parseInt(matcher.group(5));
                    day = Integer.parseInt(matcher.group(6));
                } else {
                    // DD MMM YYYY format (would need month name mapping)
                    return LocalDate.now();
                }
                
                // Handle 2-digit years
                if (year < 100) {
                    year += 2000;
                }
                
                // Validate date components
                if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
                    return LocalDate.of(year, month, day);
                }
            } catch (Exception e) {
                log.warn("Failed to parse date from text: {}", text, e);
            }
        }
        
        // Default to today if no valid date found
        return LocalDate.now();
    }

    private String extractDescription(String text) {
        String[] lines = text.split("\n");
        
        // Look for merchant patterns in each line
        for (String line : lines) {
            line = line.trim();
            if (!line.isEmpty() && line.length() > 3) {
                Matcher merchantMatcher = MERCHANT_PATTERNS.matcher(line.toUpperCase());
                if (merchantMatcher.find()) {
                    for (int i = 1; i <= merchantMatcher.groupCount(); i++) {
                        String group = merchantMatcher.group(i);
                        if (group != null && !group.trim().isEmpty()) {
                            return group.trim();
                        }
                    }
                }
            }
        }
        
        // Fallback: use first non-empty line that looks like a merchant
        for (String line : lines) {
            line = line.trim();
            if (!line.isEmpty() && line.length() > 3 && line.length() < 100) {
                // Skip lines that are likely not merchant names
                if (!line.matches(".*\\d.*") && !line.contains("TOTAL") && !line.contains("AMOUNT")) {
                    return line.substring(0, Math.min(line.length(), 50));
                }
            }
        }
        
        return "Receipt Upload";
    }
}
