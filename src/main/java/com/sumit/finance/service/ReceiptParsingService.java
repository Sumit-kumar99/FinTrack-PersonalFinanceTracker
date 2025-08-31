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
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
@Slf4j
public class ReceiptParsingService {

    private final Tesseract tesseract;
    private static final Pattern AMOUNT_PATTERN = Pattern.compile("\\$?([0-9]+\\.[0-9]{2})");
    private static final Pattern DATE_PATTERN = Pattern.compile("(\\d{1,2})[/-](\\d{1,2})[/-](\\d{2,4})");
    private static final Pattern MERCHANT_PATTERN = Pattern.compile("^([A-Z][A-Z\\s&]+)");

    public ReceiptParsingService() {
        this.tesseract = new Tesseract();
        // Set Tesseract data path - you'll need to install Tesseract on your system
        // this.tesseract.setDatapath("/usr/share/tessdata");
        this.tesseract.setDatapath("C:\\Program Files\\Tesseract-OCR\\tessdata");
        this.tesseract.setLanguage("eng");

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
        
        // Extract amount
        Matcher amountMatcher = AMOUNT_PATTERN.matcher(text);
        if (amountMatcher.find()) {
            double amount = Double.parseDouble(amountMatcher.group(1));
            
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
            // Note: categoryId will need to be set by the user or auto-detected
            
            transactions.add(transaction);
        }
        
        return transactions;
    }

    private LocalDate extractDate(String text) {
        Matcher dateMatcher = DATE_PATTERN.matcher(text);
        if (dateMatcher.find()) {
            try {
                int month = Integer.parseInt(dateMatcher.group(1));
                int day = Integer.parseInt(dateMatcher.group(2));
                int year = Integer.parseInt(dateMatcher.group(3));
                
                // Handle 2-digit years
                if (year < 100) {
                    year += 2000;
                }
                
                return LocalDate.of(year, month, day);
            } catch (Exception e) {
                log.warn("Failed to parse date from text: {}", text, e);
            }
        }
        
        // Default to today if no date found
        return LocalDate.now();
    }

    private String extractDescription(String text) {
        // Try to find merchant name at the beginning of lines
        String[] lines = text.split("\n");
        for (String line : lines) {
            line = line.trim();
            if (!line.isEmpty() && line.length() > 3) {
                Matcher merchantMatcher = MERCHANT_PATTERN.matcher(line);
                if (merchantMatcher.find()) {
                    return merchantMatcher.group(1).trim();
                }
            }
        }
        
        // Fallback: use first non-empty line
        for (String line : lines) {
            line = line.trim();
            if (!line.isEmpty() && line.length() > 3) {
                return line.substring(0, Math.min(line.length(), 50));
            }
        }
        
        return "Receipt Upload";
    }
}
