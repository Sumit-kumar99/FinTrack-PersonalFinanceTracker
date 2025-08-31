package com.sumit.finance.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class SummaryResponse {
    private Double totalIncome;
    private Double totalExpense;
    private Double balance;
    private String username;
}
