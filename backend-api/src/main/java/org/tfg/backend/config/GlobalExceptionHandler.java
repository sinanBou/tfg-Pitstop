package org.tfg.backend.config;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice // <--- Esto hace que escuche errores de TODOS los controladores
public class GlobalExceptionHandler {

    // Captura cualquier RuntimeException (como las que lanzamos en AuthService)
    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<String> handleRuntimeException(RuntimeException ex) {
        // Devuelve un error 400 (Bad Request) y SOLO el mensaje de texto
        return ResponseEntity.badRequest().body(ex.getMessage());
    }
}