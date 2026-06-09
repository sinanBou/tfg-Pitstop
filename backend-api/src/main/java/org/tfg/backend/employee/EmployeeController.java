package org.tfg.backend.employee;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.tfg.backend.user.User;

import java.util.List;
import java.util.UUID;

/**
 * Controlador REST para gestionar la información, perfiles, avatares
 * y roles administrativos de los empleados en Pitstop.
 */
@RestController
@RequestMapping("/api/employees")
@RequiredArgsConstructor
public class EmployeeController {

    private final EmployeService employeService;

    /**
     * Devuelve el perfil del empleado que ha iniciado sesión.
     *
     * @param user Detalles del usuario autenticado.
     * @return DTO del perfil del empleado.
     */
    @GetMapping("/me")
    public ResponseEntity<EmployeeDTO> getMe(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(employeService.getEmployeeProfile(user.getEmail()));
    }

    /**
     * Actualiza el perfil del empleado autenticado (campos seguros).
     *
     * @param user Detalles del usuario autenticado.
     * @param request Datos del perfil a actualizar.
     * @return DTO del perfil del empleado modificado.
     */
    @PutMapping("/me")
    public ResponseEntity<EmployeeDTO> updateMe(
            @AuthenticationPrincipal User user,
            @RequestBody UpdateProfileRequest request) {
        return ResponseEntity.ok(employeService.updateProfile(user.getEmail(), request));
    }

    /**
     * Sube una imagen de perfil y la asocia al empleado logueado.
     *
     * @param user Detalles del usuario autenticado.
     * @param file Archivo multipart correspondiente a la imagen.
     * @return DTO del empleado con la nueva imagen de perfil asociada.
     */
    @PostMapping("/me/avatar")
    public ResponseEntity<EmployeeDTO> uploadAvatar(
            @AuthenticationPrincipal User user,
            @RequestParam("file") MultipartFile file) {
        try {
            return ResponseEntity.ok(employeService.uploadProfilePicture(user.getEmail(), file));
        } catch (Exception e) {
            throw new RuntimeException("Error al subir la imagen de perfil: " + e.getMessage(), e);
        }
    }

    /**
     * Elimina la imagen de perfil del empleado logueado.
     *
     * @param user Detalles del usuario autenticado.
     * @return DTO del empleado con la imagen a nulo.
     */
    @DeleteMapping("/me/avatar")
    public ResponseEntity<EmployeeDTO> deleteAvatar(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(employeService.deleteProfilePicture(user.getEmail()));
    }

    /**
     * Obtiene la lista de empleados pertenecientes a un taller específico.
     *
     * @param workshopId Identificador único del taller.
     * @return Respuesta HTTP con la lista de DTOs de empleados asociados al taller.
     */
    @GetMapping("/workshop/{workshopId}")
    public ResponseEntity<List<EmployeeDTO>> getEmployeesByWorkshop(@PathVariable UUID workshopId) {
        return ResponseEntity.ok(employeService.getEmployeesByWorkshopId(workshopId));
    }

    /**
     * Registra y añade un nuevo empleado a un taller específico.
     *
     * @param workshopId Identificador único del taller.
     * @param request Datos del empleado a registrar.
     * @return Respuesta HTTP confirmando el registro del nuevo empleado.
     */
    @PostMapping("/register/{workshopId}")
    public ResponseEntity<String> addEmployeeToWorkshop(
            @PathVariable UUID workshopId,
            @RequestBody AddEmployeeRequest request) {
        try {
            employeService.addEmployeeToWorkshop(workshopId, request);
            return ResponseEntity.ok("Empleado añadido con éxito");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * Elimina a un empleado del sistema dado su identificador único.
     *
     * @param id Identificador único del empleado.
     * @return Respuesta HTTP de éxito o error.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteEmployee(@PathVariable UUID id) {
        try {
            employeService.deleteEmployee(id);
            return ResponseEntity.ok("Empleado eliminado con éxito");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * Asciende a un empleado al rol de Gerente (WORKSHOP_MANAGER).
     *
     * @param id Identificador único del empleado.
     * @return Respuesta HTTP confirmando el ascenso.
     */
    @PutMapping("/{id}/promote")
    public ResponseEntity<String> promoteToManager(@PathVariable UUID id) {
        try {
            employeService.promoteToManager(id);
            return ResponseEntity.ok("Empleado ascendido a Gerente");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * Degrada a un empleado al rol de Mecánico (WORKSHOP_STAFF).
     *
     * @param id Identificador único del empleado.
     * @return Respuesta HTTP confirmando la degradación.
     */
    @PutMapping("/{id}/demote")
    public ResponseEntity<String> demoteToStaff(@PathVariable UUID id) {
        try {
            employeService.demoteToStaff(id);
            return ResponseEntity.ok("Empleado degradado a Mecánico");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * Actualiza las secciones permitidas o accesibles para un empleado en el frontend.
     *
     * @param id Identificador único del empleado.
     * @param allowedSections Cadena serializada que representa las secciones autorizadas.
     * @return Respuesta HTTP confirmando la actualización de permisos.
     */
    @PutMapping("/{id}/allowed-sections")
    public ResponseEntity<String> updateAllowedSections(
            @PathVariable UUID id,
            @RequestParam String allowedSections) {
        try {
            employeService.updateAllowedSections(id, allowedSections);
            return ResponseEntity.ok("Permisos actualizados con éxito");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}