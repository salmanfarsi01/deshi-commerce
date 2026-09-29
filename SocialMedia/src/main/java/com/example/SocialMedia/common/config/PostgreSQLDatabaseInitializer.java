package com.example.SocialMedia.common.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.BeansException;
import org.springframework.beans.factory.config.BeanFactoryPostProcessor;
import org.springframework.beans.factory.config.ConfigurableListableBeanFactory;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.Statement;

/**
 * Ensures the target PostgreSQL database exists before HikariCP attempts connection.
 */
@Configuration
public class PostgreSQLDatabaseInitializer implements BeanFactoryPostProcessor {

    private static final Logger log = LoggerFactory.getLogger(PostgreSQLDatabaseInitializer.class);

    @Override
    public void postProcessBeanFactory(ConfigurableListableBeanFactory beanFactory) throws BeansException {
        Environment env = beanFactory.getBean(Environment.class);
        String url = env.getProperty("spring.datasource.url", "jdbc:postgresql://localhost:5432/deshi_commerce_db");
        String username = env.getProperty("spring.datasource.username", "postgres");
        String password = env.getProperty("spring.datasource.password", "Admin@123");

        try {
            int lastSlash = url.lastIndexOf('/');
            if (lastSlash != -1) {
                int questionMark = url.indexOf('?', lastSlash);
                String dbName = (questionMark != -1) ? url.substring(lastSlash + 1, questionMark) : url.substring(lastSlash + 1);
                String baseUrl = url.substring(0, lastSlash + 1) + "postgres";

                try (Connection conn = DriverManager.getConnection(baseUrl, username, password);
                     Statement stmt = conn.createStatement()) {
                    ResultSet rs = stmt.executeQuery("SELECT 1 FROM pg_database WHERE datname = '" + dbName + "'");
                    if (!rs.next()) {
                        log.info("Database '{}' does not exist. Creating database automatically...", dbName);
                        stmt.executeUpdate("CREATE DATABASE " + dbName);
                        log.info("Database '{}' successfully created!", dbName);
                    } else {
                        log.info("Database '{}' already exists on PostgreSQL server.", dbName);
                    }
                }
            }
        } catch (Exception e) {
            log.warn("Notice: Database pre-check encountered: {} (PostgreSQL may already have the database or custom privileges apply)", e.getMessage());
        }
    }
}
