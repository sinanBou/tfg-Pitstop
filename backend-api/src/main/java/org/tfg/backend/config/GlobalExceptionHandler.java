package org.tfg.backend.config;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.server.ResponseStatusException;

/**
 * Controlador de excepciones global que centraliza y unifica el formato de las respuestas
 * de error del backend hacia el cliente/frontend.
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    /**
     * Captura específica para excepciones de tipo {@link ResponseStatusException}.
     * Permite extraer limpiamente la razón interna del error para no mostrar el mensaje de depuración por defecto.
     *
     * @param ex Excepción capturada.
     * @return ResponseEntity con el código de estado HTTP original y la descripción limpia del error.
     */
    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<String> handleResponseStatusException(ResponseStatusException ex) {
        return ResponseEntity.status(ex.getStatusCode()).body(ex.getReason());
    }

    /**
     * Captura general para excepciones en tiempo de ejecución de tipo {@link RuntimeException}.
     * Devuelve el error bajo un código HTTP 400 Bad Request.
     *
     * @param ex Excepción de ejecución capturada.
     * @return ResponseEntity con el código HTTP 400 y el mensaje descriptivo del fallo.
     */
    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<String> handleRuntimeException(RuntimeException ex) {
        return ResponseEntity.badRequest().body(ex.getMessage());
    }
}