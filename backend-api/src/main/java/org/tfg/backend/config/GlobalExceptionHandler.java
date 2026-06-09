package org.tfg.backend.config;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.server.ResponseStatusException;

/**
 * Controlador global para la interceptación y tratamiento unificado de excepciones en toda la API.
 * Evita la exposición de trazas internas convirtiéndolas en respuestas HTTP limpias y comprensibles.
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    /**
     * Captura específica para excepciones de tipo {@link ResponseStatusException}.
     * Extrae únicamente el mensaje de error limpio provisto por el sistema.
     *
     * @param ex Excepción capturada.
     * @return ResponseEntity con el código HTTP correspondiente y la razón limpia.
     */
    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<String> handleResponseStatusException(ResponseStatusException ex) {
        return ResponseEntity.status(ex.getStatusCode()).body(ex.getReason());
    }

    /**
     * Captura general para excepciones de tipo {@link RuntimeException}.
     * Retorna el mensaje de error amigable en una respuesta HTTP 400 Bad Request.
     *
     * @param ex Excepción capturada.
     * @return ResponseEntity con código 400 y el mensaje de error.
     */
    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<String> handleRuntimeException(RuntimeException ex) {
        return ResponseEntity.badRequest().body(ex.getMessage());
    }
}