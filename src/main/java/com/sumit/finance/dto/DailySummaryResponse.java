package com.sumit.finance.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DailySummaryResponse {
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate date;
    private Double totalIncome;
    private Double totalExpense;
}
