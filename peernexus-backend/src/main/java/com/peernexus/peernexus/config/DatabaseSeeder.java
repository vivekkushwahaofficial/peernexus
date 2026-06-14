package com.peernexus.peernexus.config;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.peernexus.peernexus.doubt.entity.Category;
import com.peernexus.peernexus.doubt.repository.CategoryRepository;

/**
 * Runs once at application startup and seeds the {@code categories} table
 * with the default academic categories required by the Doubt module.
 *
 * <p>Each entry is only inserted if a category with the same name does not
 * already exist (case-insensitive check via
 * {@link CategoryRepository#findByNameIgnoreCase(String)}).
 * Subsequent restarts are therefore completely idempotent — no duplicates
 * will ever be created.
 */
@Configuration
public class DatabaseSeeder {

    private static final Logger log = LoggerFactory.getLogger(DatabaseSeeder.class);

    /**
     * Ordered list of (name, description) pairs to seed.
     * Add new entries here whenever a new default category is required.
     */
    private static final List<String[]> DEFAULT_CATEGORIES = List.of(
            new String[]{"Java",
                    "Core Java concepts, JVM internals, collections, concurrency, and Java 17+ features."},
            new String[]{"Spring Boot",
                    "Spring Boot framework, REST APIs, Spring Security, JPA, and microservices."},
            new String[]{"React",
                    "React.js library, hooks, state management, routing, and frontend architecture."},
            new String[]{"DSA",
                    "Data Structures and Algorithms — arrays, trees, graphs, sorting, and complexity analysis."},
            new String[]{"DBMS",
                    "Database Management Systems — SQL, normalization, transactions, and indexing."},
            new String[]{"Operating Systems",
                    "Process scheduling, memory management, file systems, deadlocks, and concurrency."},
            new String[]{"Computer Networks",
                    "OSI model, TCP/IP, HTTP, DNS, sockets, and network security fundamentals."},
            new String[]{"OOP",
                    "Object-Oriented Programming principles — encapsulation, inheritance, polymorphism, and design patterns."},
            new String[]{"Aptitude",
                    "Quantitative aptitude, logical reasoning, and verbal ability for placements."},
            new String[]{"Interview Preparation",
                    "Resume tips, behavioral questions, system design, and company-specific preparation."}
    );

    @Bean
    public CommandLineRunner seedCategories(CategoryRepository categoryRepository) {
        return args -> {
            log.info("=== DatabaseSeeder: checking default categories ===");
            int inserted = 0;
            int skipped = 0;

            for (String[] entry : DEFAULT_CATEGORIES) {
                String name = entry[0];
                String description = entry[1];

                boolean exists = categoryRepository.findByNameIgnoreCase(name).isPresent();
                if (exists) {
                    log.debug("Category already exists — skipping: '{}'", name);
                    skipped++;
                } else {
                    Category category = Category.builder()
                            .name(name)
                            .description(description)
                            .build();
                    categoryRepository.save(category);
                    log.info("Seeded category: '{}'", name);
                    inserted++;
                }
            }

            log.info("=== DatabaseSeeder done: {} inserted, {} skipped ===", inserted, skipped);
        };
    }
}
