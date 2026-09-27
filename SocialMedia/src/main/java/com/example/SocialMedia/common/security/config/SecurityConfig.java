package com.example.SocialMedia.common.security.config;

import com.example.SocialMedia.common.security.jwt.CustomAccessDeniedHandler;
import com.example.SocialMedia.common.security.jwt.JwtAuthenticationEntryPoint;
import com.example.SocialMedia.common.security.jwt.JwtAuthenticationFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final JwtAuthenticationEntryPoint jwtAuthenticationEntryPoint;
    private final CustomAccessDeniedHandler customAccessDeniedHandler;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter,
                          JwtAuthenticationEntryPoint jwtAuthenticationEntryPoint,
                          CustomAccessDeniedHandler customAccessDeniedHandler) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
        this.jwtAuthenticationEntryPoint = jwtAuthenticationEntryPoint;
        this.customAccessDeniedHandler = customAccessDeniedHandler;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .exceptionHandling(ex -> ex
                        .authenticationEntryPoint(jwtAuthenticationEntryPoint)
                        .accessDeniedHandler(customAccessDeniedHandler)
                )
                .authorizeHttpRequests(auth -> auth
                        // Public Auth APIs
                        .requestMatchers("/api/v1/auth/**").permitAll()
                        // Public Catalog Browsing
                        .requestMatchers(HttpMethod.GET, "/api/v1/products/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/v1/categories/**").permitAll()
                        // Public Payment Methods & Webhooks
                        .requestMatchers(HttpMethod.GET, "/api/v1/payments/methods").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/v1/payments/verify").permitAll()
                        // Admin Endpoints require ROLE_ADMIN
                        .requestMatchers("/api/v1/admin/**").hasRole("ADMIN")
                        // Customer Endpoints require Authentication
                        .requestMatchers("/api/v1/users/**").authenticated()
                        .requestMatchers("/api/v1/cart/**").authenticated()
                        .requestMatchers("/api/v1/addresses/**").authenticated()
                        .requestMatchers("/api/v1/orders/**").authenticated()
                        .requestMatchers("/api/v1/payments/**").authenticated()
                        // Any other request must be authenticated
                        .anyRequest().authenticated()
                )
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
