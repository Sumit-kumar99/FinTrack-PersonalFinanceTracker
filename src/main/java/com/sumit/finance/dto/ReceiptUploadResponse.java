package com.sumit.finance.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ReceiptUploadResponse {
    private String message;
    private List<TransactionRequest> parsedTransactions;
    private String originalFilename;
    private String fileType;
    private boolean success;
    private String errorMessage;
}
