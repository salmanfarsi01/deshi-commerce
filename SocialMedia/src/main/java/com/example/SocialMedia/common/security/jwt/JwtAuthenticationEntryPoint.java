package com.example.SocialMedia.common.security.jwt;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.MediaType;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.time.Instant;

@Component
public class JwtAuthenticationEntryPoint implements AuthenticationEntryPoint {

    @Override
    public void commence(HttpServletRequest request,
                         HttpServletResponse response,
                         AuthenticationException authException) throws IOException {
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);

        String json = String.format(
                "{\"success\":false,\"message\":\"Full authentication is required to access this resource. Please provide a valid Bearer token.\",\"code\":\"UNAUTHORIZED\",\"timestamp\":\"%s\"}",
                Instant.now().toString()
        );
        response.getWriter().write(json);
    }
}
