package org.tfg.backend.config;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.ArrayList;

import static org.junit.jupiter.api.Assertions.*;

@ExtendWith(MockitoExtension.class)
class JwtServiceImplTest {

    private JwtServiceImpl jwtService;
    private final String secretKey = "9a4f2c8d3b7a1e5f8c3d2e1a7b6c5d4e3f2g1h0i9j8k7l6m5n4o3p2q1r0s9t8u";

    @BeforeEach
    void setUp() {
        jwtService = new JwtServiceImpl();
        ReflectionTestUtils.setField(jwtService, "secretKey", secretKey);
    }

    @Test
    void generarToken_ShouldCreateValidToken() {
        String username = "sinan@example.com";

        String token = jwtService.generarToken(username);

        assertNotNull(token);
        assertFalse(token.isEmpty());
        assertEquals(username, jwtService.extractUsername(token));
    }

    @Test
    void isTokenValid_ShouldReturnTrueForMatchingUserAndNotExpired() {
        String username = "sinan@example.com";
        String token = jwtService.generarToken(username);

        UserDetails userDetails = new User(username, "password", new ArrayList<>());

        assertTrue(jwtService.isTokenValid(token, userDetails));
    }

    @Test
    void isTokenValid_ShouldReturnFalseForMismatchingUser() {
        String username = "sinan@example.com";
        String token = jwtService.generarToken(username);

        UserDetails otherUserDetails = new User("other@example.com", "password", new ArrayList<>());

        assertFalse(jwtService.isTokenValid(token, otherUserDetails));
    }
}
