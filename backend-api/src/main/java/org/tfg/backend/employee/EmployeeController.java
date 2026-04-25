package org.tfg.backend.employee;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
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
}