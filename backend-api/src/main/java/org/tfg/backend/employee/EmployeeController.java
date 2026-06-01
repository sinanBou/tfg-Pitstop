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

@RestController
@RequestMapping("/api/employees")
@RequiredArgsConstructor
public class EmployeeController {

    private final EmployeService employeService;

    /**
     * Devuelve el perfil del empleado que ha iniciado sesión.
     */
    @GetMapping("/me")
    public ResponseEntity<EmployeeDTO> getMe(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(employeService.getEmployeeProfile(user.getEmail()));
    }

    /**
     * Actualiza el perfil del empleado autenticado (campos seguros).
     */
    @PutMapping("/me")
    public ResponseEntity<EmployeeDTO> updateMe(
            @AuthenticationPrincipal User user,
            @RequestBody UpdateProfileRequest request) {
        return ResponseEntity.ok(employeService.updateProfile(user.getEmail(), request));
    }

    /**
     * Sube una imagen de perfil y la asocia al empleado logueado.
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
     */
    @org.springframework.web.bind.annotation.DeleteMapping("/me/avatar")
    public ResponseEntity<EmployeeDTO> deleteAvatar(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(employeService.deleteProfilePicture(user.getEmail()));
    }


    @GetMapping("/workshop/{workshopId}")
    public ResponseEntity<java.util.List<EmployeeDTO>> getEmployeesByWorkshop(@org.springframework.web.bind.annotation.PathVariable java.util.UUID workshopId) {
        return ResponseEntity.ok(employeService.getEmployeesByWorkshopId(workshopId));
    }

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

    @org.springframework.web.bind.annotation.DeleteMapping("/{id}")
    public ResponseEntity<String> deleteEmployee(@org.springframework.web.bind.annotation.PathVariable java.util.UUID id) {
        try {
            employeService.deleteEmployee(id);
            return ResponseEntity.ok("Empleado eliminado con éxito");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @org.springframework.web.bind.annotation.PutMapping("/{id}/promote")
    public ResponseEntity<String> promoteToManager(@org.springframework.web.bind.annotation.PathVariable java.util.UUID id) {
        try {
            employeService.promoteToManager(id);
            return ResponseEntity.ok("Empleado ascendido a Gerente");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @org.springframework.web.bind.annotation.PutMapping("/{id}/demote")
    public ResponseEntity<String> demoteToStaff(@org.springframework.web.bind.annotation.PathVariable java.util.UUID id) {
        try {
            employeService.demoteToStaff(id);
            return ResponseEntity.ok("Empleado degradado a Mecánico");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

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