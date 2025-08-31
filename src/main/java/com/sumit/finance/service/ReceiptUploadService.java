package com.sumit.finance.service;

import com.sumit.finance.dto.ReceiptUploadResponse;
import com.sumit.finance.dto.TransactionRequest;
import com.sumit.finance.model.Transaction;
import com.sumit.finance.model.TransactionType;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class ReceiptUploadService {

    private final EnhancedReceiptParsingService receiptParsingService;
    private final TransactionService transactionService;
    private final CategoryService categoryService;

    public ReceiptUploadResponse uploadReceipt(MultipartFile file, String username) {
        try {
            // Validate file
            if (file.isEmpty()) {
                return ReceiptUploadResponse.builder()
                        .success(false)
                        .errorMessage("File is empty")
                        .build();
            }

            // Parse receipt
            List<TransactionRequest> parsedTransactions = receiptParsingService.parseReceipt(file);
            
            if (parsedTransactions.isEmpty()) {
                return ReceiptUploadResponse.builder()
                        .success(false)
                        .errorMessage("No transaction details could be extracted from the receipt")
                        .build();
            }

            // Auto-create transactions
            List<Transaction> createdTransactions = new ArrayList<>();
            for (TransactionRequest parsedTransaction : parsedTransactions) {
                // Set default category if not specified
                if (parsedTransaction.getCategoryId() == null) {
                    parsedTransaction.setCategoryId(getDefaultCategoryId(parsedTransaction.getType()));
                }
                
                Transaction transaction = transactionService.addTransaction(parsedTransaction, username);
                createdTransactions.add(transaction);
            }

            return ReceiptUploadResponse.builder()
                    .success(true)
                    .message("Receipt processed successfully. " + createdTransactions.size() + " transaction(s) created.")
                    .parsedTransactions(parsedTransactions)
                    .originalFilename(file.getOriginalFilename())
                    .fileType(file.getContentType())
                    .build();

        } catch (IllegalArgumentException e) {
            log.error("Invalid file type", e);
            return ReceiptUploadResponse.builder()
                    .success(false)
                    .errorMessage("Unsupported file type: " + e.getMessage())
                    .build();
        } catch (IOException e) {
            log.error("File processing error", e);
            return ReceiptUploadResponse.builder()
                    .success(false)
                    .errorMessage("Failed to process file: " + e.getMessage())
                    .build();
        } catch (Exception e) {
            log.error("Unexpected error during receipt processing", e);
            return ReceiptUploadResponse.builder()
                    .success(false)
                    .errorMessage("An unexpected error occurred: " + e.getMessage())
                    .build();
        }
    }

    private Long getDefaultCategoryId(TransactionType type) {
        try {
            // Try to find a default category based on transaction type
            if (type == TransactionType.EXPENSE) {
                // Look for "General" or "Other" category
                return 1L; // Default category ID - you might want to make this configurable
            } else if (type == TransactionType.INCOME) {
                // Look for "Salary" or "Other Income" category
                return 2L; // Default category ID
            }
        } catch (Exception e) {
            log.warn("Failed to get default category", e);
        }
        
        // Return a safe default
        return 1L;
    }
}
