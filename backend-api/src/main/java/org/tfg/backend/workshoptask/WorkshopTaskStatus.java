package org.tfg.backend.workshoptask;

/**
 * Enumerado que representa el estado de una tarea asignada en el taller.
 * Los estados controlan el ciclo de vida y el flujo de trabajo de cada reparación
 * (pendiente, confirmada, en curso, completada o cancelada).
 */
public enum WorkshopTaskStatus {
    PENDING,
    CONFIRMED,
    IN_PROGRESS,
    COMPLETED,
    CANCELLED
}

