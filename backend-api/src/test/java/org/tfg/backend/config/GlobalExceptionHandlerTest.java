package org.tfg.backend.config;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.ResponseEntity;

import static org.junit.jupiter.api.Assertions.*;

class GlobalExceptionHandlerTest {

    private GlobalExceptionHandler exceptionHandler;

    @BeforeEach
    void setUp() {
        exceptionHandler = new GlobalExceptionHandler();
    }

    @Test
    void handleRuntimeException_ShouldReturnBadRequestWithErrorMessage() {
        RuntimeException ex = new RuntimeException("Error de validación del taller");

        ResponseEntity<String> response = exceptionHandler.handleRuntimeException(ex);

        assertNotNull(response);
        assertEquals(400, response.getStatusCode().value());
        assertEquals("Error de validación del taller", response.getBody());
    }
}
