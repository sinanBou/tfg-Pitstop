package org.tfg.backend.workshop;

import lombok.Data;

import java.util.UUID;

@Data
public class WorkshopRequest {
    private String cif;
    private String companyName;
    private UUID ownerId; // Enviamos el ID del empleado que será dueño
}