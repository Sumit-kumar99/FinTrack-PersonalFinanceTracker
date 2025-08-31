package com.sumit.finance.repository;

import com.sumit.finance.model.Transaction;
import com.sumit.finance.model.User;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    // List<Transaction> findByDateBetween(LocalDate start, LocalDate end);

    Page<Transaction> findAll(Pageable pageable);

    Page<Transaction> findByDateBetween(LocalDate startDate, LocalDate endDate, Pageable pageable);

    Page<Transaction> findByUser(User user, Pageable pageable);
    
    Page<Transaction> findByUserAndDateBetween(User user, LocalDate startDate, LocalDate endDate, Pageable pageable);

    @Query("SELECT t.category.name, SUM(t.amount), t.type " +
           "FROM Transaction t WHERE t.user = :user " +
           "GROUP BY t.category.name, t.type")
    List<Object[]> getSummaryByCategory(User user);

    @Query("SELECT t.date, t.type, SUM(t.amount) " +
           "FROM Transaction t WHERE t.user = :user " +
           "GROUP BY t.date, t.type " +
           "ORDER BY t.date ASC")
    List<Object[]> getDailySummary(User user);

    @Query("SELECT SUM(t.amount) FROM Transaction t WHERE t.user = :user AND t.type = 'INCOME'")
    Double getTotalIncome(User user);

    @Query("SELECT SUM(t.amount) FROM Transaction t WHERE t.user = :user AND t.type = 'EXPENSE'")
    Double getTotalExpense(User user);
}
