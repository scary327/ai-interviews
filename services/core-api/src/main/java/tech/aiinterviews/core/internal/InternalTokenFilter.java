package tech.aiinterviews.core.internal;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.AuthorityUtils;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;

public class InternalTokenFilter extends OncePerRequestFilter {

	static final String HEADER = "X-Internal-Token";

	private final byte[] expectedToken;

	public InternalTokenFilter(String expectedToken) {
		this.expectedToken = expectedToken.getBytes(StandardCharsets.UTF_8);
	}

	@Override
	protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
			throws ServletException, IOException {
		String token = request.getHeader(HEADER);
		if (token != null && MessageDigest.isEqual(expectedToken, token.getBytes(StandardCharsets.UTF_8))) {
			SecurityContext context = SecurityContextHolder.createEmptyContext();
			context.setAuthentication(UsernamePasswordAuthenticationToken.authenticated(
					"ai-service", null, AuthorityUtils.createAuthorityList("ROLE_INTERNAL")));
			SecurityContextHolder.setContext(context);
		}
		chain.doFilter(request, response);
	}

}
