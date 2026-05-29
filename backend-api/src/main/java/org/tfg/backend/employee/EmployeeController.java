package org.tfg.backend.employee;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.tfg.backend.user.User;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/employees")
@RequiredArgsConstructor
public class EmployeeController {

    private final EmployeeProfileService employeeProfileService;
    private final EmployeeAdminService employeeAdminService;

    /**
     * Devuelve el perfil del empleado que ha iniciado sesión.
     */
    @GetMapping("/me")
    public ResponseEntity<EmployeeDTO> getMe(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(employeeProfileService.getEmployeeProfile(user.getEmail()));
    }

    /**
     * Actualiza el perfil del empleado autenticado (campos seguros).
     */
    @PutMapping("/me")
    public ResponseEntity<EmployeeDTO> updateMe(
            @AuthenticationPrincipal User user,
            @RequestBody UpdateProfileRequest request) {
        return ResponseEntity.ok(employeeProfileService.updateProfile(user.getEmail(), request));
    }

    /**
     * Sube una imagen de perfil y la asocia al empleado logueado.
     */
    @PostMapping("/me/avatar")
    public ResponseEntity<EmployeeDTO> uploadAvatar(
            @AuthenticationPrincipal User user,
            @RequestParam("file") MultipartFile file) {
        try {
            return ResponseEntity.ok(employeeProfileService.uploadProfilePicture(user.getEmail(), file));
        } catch (Exception e) {
            throw new RuntimeException("Error al subir la imagen de perfil: " + e.getMessage(), e);
        }
    }

    /**
     * Elimina la imagen de perfil del empleado logueado.
     */
    @DeleteMapping("/me/avatar")
    public ResponseEntity<EmployeeDTO> deleteAvatar(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(employeeProfileService.deleteProfilePicture(user.getEmail()));
    }

    @GetMapping("/workshop/{workshopId}")
    public ResponseEntity<List<EmployeeDTO>> getEmployeesByWorkshop(@PathVariable UUID workshopId) {
        return ResponseEntity.ok(employeeAdminService.getEmployeesByWorkshopId(workshopId));
    }

    @PostMapping("/register/{workshopId}")
    public ResponseEntity<String> addEmployeeToWorkshop(
            @PathVariable UUID workshopId,
            @RequestBody AddEmployeeRequest request) {
        try {
            employeeAdminService.addEmployeeToWorkshop(workshopId, request);
            return ResponseEntity.ok("Empleado añadido con éxito");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteEmployee(@PathVariable UUID id) {
        try {
            employeeAdminService.deleteEmployee(id);
            return ResponseEntity.ok("Empleado eliminado con éxito");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{id}/promote")
    public ResponseEntity<String> promoteToManager(@PathVariable UUID id) {
        try {
            employeeAdminService.promoteToManager(id);
            return ResponseEntity.ok("Empleado ascendido a Gerente");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{id}/demote")
    public ResponseEntity<String> demoteToStaff(@PathVariable UUID id) {
        try {
            employeeAdminService.demoteToStaff(id);
            return ResponseEntity.ok("Empleado degradado a Mecánico");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{id}/allowed-sections")
    public ResponseEntity<String> updateAllowedSections(
            @PathVariable UUID id,
            @RequestParam String allowedSections) {
        try {
            employeeAdminService.updateAllowedSections(id, allowedSections);
            return ResponseEntity.ok("Permisos actualizados con éxito");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}