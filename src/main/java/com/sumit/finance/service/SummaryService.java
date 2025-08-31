package com.sumit.finance.service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;

import com.sumit.finance.dto.CategorySummaryResponse;
import com.sumit.finance.dto.DailySummaryResponse;
import com.sumit.finance.dto.SummaryResponse;
import com.sumit.finance.model.User;
import com.sumit.finance.repository.TransactionRepository;
import com.sumit.finance.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class SummaryService {

    private final TransactionRepository transactionRepository;
    private final UserRepository userRepository;

    public SummaryResponse getSummary(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Double totalIncome = transactionRepository.getTotalIncome(user);
        Double totalExpense = transactionRepository.getTotalExpense(user);

        if (totalIncome == null) totalIncome = 0.0;
        if (totalExpense == null) totalExpense = 0.0;

        Double balance = totalIncome - totalExpense;

        return new SummaryResponse(totalIncome, totalExpense, balance, username);
    }

    public List<CategorySummaryResponse> getSummaryByCategory(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        List<Object[]> results = transactionRepository.getSummaryByCategory(user);

        return results.stream()
                .map(r -> new CategorySummaryResponse(
                        (String) r[0],            // categoryName
                        (Double) r[1],            // totalAmount
                        r[2].toString()           // type
                ))
                .toList();
    }

    public List<DailySummaryResponse> getDailySummary(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        List<Object[]> results = transactionRepository.getDailySummary(user);

        Map<LocalDate, DailySummaryResponse> summaryMap = new LinkedHashMap<>();

        for (Object[] row : results) {
            LocalDate date = (LocalDate) row[0];
            String type = row[1].toString();
            Double total = (Double) row[2];

            summaryMap.putIfAbsent(date, new DailySummaryResponse(date, 0.0, 0.0));

            DailySummaryResponse daily = summaryMap.get(date);
            if (type.equals("INCOME")) {
                daily.setTotalIncome(total);
            } else {
                daily.setTotalExpense(total);
            }
        }

        return new ArrayList<>(summaryMap.values());
    }

}

