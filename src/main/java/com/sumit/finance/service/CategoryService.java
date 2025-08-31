package com.sumit.finance.service;

import com.sumit.finance.model.Category;
import com.sumit.finance.model.User;
import com.sumit.finance.repository.CategoryRepository;
import com.sumit.finance.repository.UserRepository;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;

    public Category createCategory(Category category, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        category.setUser(user);
        return categoryRepository.save(category);
    }

    public List<Category> getAllCategories(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return categoryRepository.findByUser(user);
    }

    public Category getCategoryById(Long id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Category not found"));
    }
}
