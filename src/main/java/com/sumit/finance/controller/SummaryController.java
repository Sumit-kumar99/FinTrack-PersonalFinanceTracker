package com.sumit.finance.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.sumit.finance.dto.CategorySummaryResponse;
import com.sumit.finance.dto.DailySummaryResponse;
import com.sumit.finance.dto.SummaryResponse;
import com.sumit.finance.service.SummaryService;

import lombok.RequiredArgsConstructor;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/api/summary")
@RequiredArgsConstructor
public class SummaryController {

    private final SummaryService summaryService;

    // Existing summary API
    @GetMapping
    public ResponseEntity<SummaryResponse> getSummary() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        return ResponseEntity.ok(summaryService.getSummary(username));
    }

    // New: Summary by category
    @GetMapping("/by-category")
    public ResponseEntity<List<CategorySummaryResponse>> getSummaryByCategory() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        return ResponseEntity.ok(summaryService.getSummaryByCategory(username));
    }

    @GetMapping("/by-day")
    public ResponseEntity<List<DailySummaryResponse>> getDailySummary() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        return ResponseEntity.ok(summaryService.getDailySummary(username));
    }
}
