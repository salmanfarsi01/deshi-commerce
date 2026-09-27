package com.example.SocialMedia.common.security.tenant;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
public class TenantFilter extends OncePerRequestFilter {

    public static final String TENANT_HEADER = "X-Tenant-ID";

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        try {
            String tenantHeader = request.getHeader(TENANT_HEADER);
            if (tenantHeader != null && !tenantHeader.isBlank()) {
                // Sanitize tenant ID (alphanumeric, hyphens, underscores only)
                String sanitizedTenant = tenantHeader.trim().toLowerCase().replaceAll("[^a-z0-9_-]", "");
                TenantContext.setTenantId(sanitizedTenant.isBlank() ? TenantContext.DEFAULT_TENANT_ID : sanitizedTenant);
            } else {
                TenantContext.setTenantId(TenantContext.DEFAULT_TENANT_ID);
            }

            // Expose the resolved tenant in response headers for client transparency
            response.setHeader("X-Resolved-Tenant", TenantContext.getTenantId());

            filterChain.doFilter(request, response);
        } finally {
            TenantContext.clear();
        }
    }
}
