package com.peernexus.peernexus.doubt.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.peernexus.peernexus.doubt.entity.Category;

public interface CategoryRepository extends JpaRepository<Category, Long> {

    Optional<Category> findByNameIgnoreCase(String name);
}
