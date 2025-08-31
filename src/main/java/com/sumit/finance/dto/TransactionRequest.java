package com.sumit.finance.dto;

import java.time.LocalDate;

import com.sumit.finance.model.TransactionType;

import lombok.Data;

@Data
public class TransactionRequest {
    private String description;
    private Double amount;
    private LocalDate date;
    private TransactionType type;
    private Long categoryId; // Optional field
}

