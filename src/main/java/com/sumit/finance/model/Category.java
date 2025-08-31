package com.sumit.finance.model;

import jakarta.persistence.*;
import lombok.*;
// import com.sumit.finance.model.User;

@Entity
@Table(name = "categories")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Category {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name; // e.g., Food, Rent, Salary, Travel
    
    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;
}
