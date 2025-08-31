package com.sumit.finance.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Table(name = "transactions")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Transaction {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String description;
    private Double amount;
    private LocalDate date;

    @Enumerated(EnumType.STRING)
    private TransactionType type;  // INCOME / EXPENSE

    @ManyToOne
    @JoinColumn(name = "category_id", nullable = true) // FK in transactions table, nullable
    private Category category;

    @ManyToOne
    @JoinColumn(name = "user_id")
    @JsonIgnore // Add this annotation to prevent recursion
    private User user;
}
