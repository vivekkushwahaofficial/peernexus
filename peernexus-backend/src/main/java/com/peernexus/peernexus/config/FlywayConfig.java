package com.peernexus.peernexus.config;

import org.springframework.boot.autoconfigure.flyway.FlywayMigrationStrategy;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Custom Flyway configuration to resolve checksum validation mismatches automatically.
 *
 * <p>During development or deployment, updates to migration scripts can result in
 * validation failures because the checksum stored in {@code flyway_schema_history}
 * differs from the checksum calculated from the local script files on classpath.
 *
 * <p>This strategy runs {@code flyway.repair()} at startup, aligning database checksums
 * with local ones, before proceeding to migrate schemas.
 */
@Configuration
public class FlywayConfig {

    @Bean
    public FlywayMigrationStrategy flywayMigrationStrategy() {
        return flyway -> {
            flyway.repair();
            flyway.migrate();
        };
    }
}
