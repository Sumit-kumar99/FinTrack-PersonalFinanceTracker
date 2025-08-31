package com.sumit.finance.service;

import com.sumit.finance.dto.TransactionRequest;
// import com.sumit.finance.model.Category;
// import com.sumit.finance.model.Transaction;
// import com.sumit.finance.repository.TransactionRepository;

// import lombok.RequiredArgsConstructor;

// import org.springframework.boot.autoconfigure.data.web.SpringDataWebProperties.Sort;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import com.sumit.finance.model.Transaction;
import com.sumit.finance.repository.TransactionRepository;
// import com.sumit.finance.service.CategoryService;
import lombok.RequiredArgsConstructor;
// import org.springframework.data.domain.Page;
// import org.springframework.data.domain.PageRequest;
// import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
// import org.springframework.stereotype.Service;

import java.time.LocalDate;
// import java.util.List;
import com.sumit.finance.model.Category;
import com.sumit.finance.model.User;
import com.sumit.finance.repository.UserRepository;


@Service
@RequiredArgsConstructor
public class TransactionService {


    private final TransactionRepository transactionRepository;
    private final CategoryService categoryService;
    private final UserRepository userRepository;

    public Transaction addTransaction(TransactionRequest request, String username) {
        // Validate input
        if (request.getDescription() == null || request.getDescription().trim().isEmpty()) {
            throw new IllegalArgumentException("Description is required");
        }
        if (request.getAmount() == null || request.getAmount() <= 0) {
            throw new IllegalArgumentException("Amount must be greater than 0");
        }
        if (request.getType() == null) {
            throw new IllegalArgumentException("Transaction type is required");
        }
        if (request.getDate() == null) {
            request.setDate(LocalDate.now()); // Set current date if not provided
        }

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Transaction transaction = new Transaction();
        transaction.setDescription(request.getDescription().trim());
        transaction.setAmount(request.getAmount());
        transaction.setDate(request.getDate());
        transaction.setType(request.getType());
        transaction.setUser(user);

        // Handle optional category
        if (request.getCategoryId() != null) {
            try {
                Category category = categoryService.getCategoryById(request.getCategoryId());
                transaction.setCategory(category);
            } catch (Exception e) {
                // Log the error but don't fail the transaction
                System.err.println("Category not found for ID: " + request.getCategoryId() + ". Proceeding without category.");
            }
        }

        try {
            return transactionRepository.save(transaction);
        } catch (Exception e) {
            throw new RuntimeException("Failed to save transaction: " + e.getMessage());
        }
    }

    public Page<Transaction> getTransactions(String username, int page, int size, LocalDate startDate, LocalDate endDate) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Pageable pageable = PageRequest.of(page, size, Sort.by("date").descending());

        if (startDate != null && endDate != null) {
            return transactionRepository.findByUserAndDateBetween(user, startDate, endDate, pageable);
        }

        return transactionRepository.findByUser(user, pageable);
    }
}
