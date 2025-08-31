package com.sumit.finance.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class CategorySummaryResponse {
    private String categoryName;
    private Double totalAmount;
    private String type; // INCOME or EXPENSE
}