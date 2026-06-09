package org.tfg.backend.employee;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.tfg.backend.user.User;

/**
 * Controlador REST que expone los endpoints para la gestión de empleados.
 * Permite a los empleados gestionar su propio perfil e imagen, y proporciona
 * a los administradores y gerentes endpoints para administrar la plantilla de un taller.
 */
@RestController
@RequestMapping("/api/employees")
@RequiredArgsConstructor
public class EmployeeController {

    private final EmployeService employeService;

    /**
     * Devuelve el perfil del empleado que ha iniciado sesión.
     *
     * @param user Usuario autenticado obtenido del contexto de seguridad.
     * @return Respuesta HTTP con el DTO del empleado autenticado.
     */
    @GetMapping("/me")
    public ResponseEntity<EmployeeDTO> getMe(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(employeService.getEmployeeProfile(user.getEmail()));
    }

    /**
     * Actualiza el perfil del empleado autenticado (campos seguros).
     *
     * @param user Usuario autenticado obtenido del contexto de seguridad.
     * @param request Petición con los datos del perfil a actualizar.
     * @return Respuesta HTTP con el DTO del empleado actualizado.
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
     * @param user Usuario autenticado obtenido del contexto de seguridad.
     * @param file Archivo de imagen de perfil a subir.
     * @return Respuesta HTTP con el DTO del empleado actualizado.
     */
    @org.springframework.web.bind.annotation.PostMapping("/me/avatar")
    public ResponseEntity<EmployeeDTO> uploadAvatar(
            @AuthenticationPrincipal User user,
            @org.springframework.web.bind.annotation.RequestParam("file") org.springframework.web.multipart.MultipartFile file) {
        try {
            return ResponseEntity.ok(employeService.uploadProfilePicture(user.getEmail(), file));
        } catch (Exception e) {
            throw new RuntimeException("Error al subir la imagen de perfil: " + e.getMessage(), e);
        }
    }

    /**
     * Elimina la imagen de perfil del empleado logueado.
     *
     * @param user Usuario autenticado obtenido del contexto de seguridad.
     * @return Respuesta HTTP con el DTO del empleado actualizado.
     */
    @org.springframework.web.bind.annotation.DeleteMapping("/me/avatar")
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
    public ResponseEntity<java.util.List<EmployeeDTO>> getEmployeesByWorkshop(@org.springframework.web.bind.annotation.PathVariable java.util.UUID workshopId) {
        return ResponseEntity.ok(employeService.getEmployeesByWorkshopId(workshopId));
    }

    /**
     * Registra y añade un nuevo empleado a un taller específico.
     *
     * @param workshopId Identificador único del taller.
     * @param request Datos del empleado a registrar.
     * @return Respuesta HTTP con un mensaje de confirmación del éxito o error.
     */
    @org.springframework.web.bind.annotation.PostMapping("/register/{workshopId}")
    public ResponseEntity<String> addEmployeeToWorkshop(
            @org.springframework.web.bind.annotation.PathVariable java.util.UUID workshopId,
            @org.springframework.web.bind.annotation.RequestBody AddEmployeeRequest request) {
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
     * @return Respuesta HTTP con un mensaje de éxito o error.
     */
    @org.springframework.web.bind.annotation.DeleteMapping("/{id}")
    public ResponseEntity<String> deleteEmployee(@org.springframework.web.bind.annotation.PathVariable java.util.UUID id) {
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
     * @return Respuesta HTTP con un mensaje de éxito o error.
     */
    @org.springframework.web.bind.annotation.PutMapping("/{id}/promote")
    public ResponseEntity<String> promoteToManager(@org.springframework.web.bind.annotation.PathVariable java.util.UUID id) {
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
     * @return Respuesta HTTP con un mensaje de éxito o error.
     */
    @org.springframework.web.bind.annotation.PutMapping("/{id}/demote")
    public ResponseEntity<String> demoteToStaff(@org.springframework.web.bind.annotation.PathVariable java.util.UUID id) {
        try {
            employeService.demoteToStaff(id);
            return ResponseEntity.ok("Empleado degradado a Mecánico");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * Actualiza las secciones permitidas o accesibles para un empleado.
     *
     * @param id Identificador único del empleado.
     * @param allowedSections Cadena que representa las secciones a las que el empleado tiene permitido el acceso.
     * @return Respuesta HTTP con un mensaje de éxito o error.
     */
    @org.springframework.web.bind.annotation.PutMapping("/{id}/allowed-sections")
    public ResponseEntity<String> updateAllowedSections(
            @org.springframework.web.bind.annotation.PathVariable java.util.UUID id,
            @org.springframework.web.bind.annotation.RequestParam String allowedSections) {
        try {
            employeService.updateAllowedSections(id, allowedSections);
            return ResponseEntity.ok("Permisos actualizados con éxito");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}