package org.tfg.backend.user;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.tfg.backend.user.service.UserAdminService;
import org.tfg.backend.user.service.UserLookupService;

/**
 * Controlador REST que gestiona las operaciones del perfil del usuario actualmente autenticado,
 * como consultar su información personal, cambiar la contraseña o solicitar la baja de su cuenta.
 */
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserLookupService userLookupService;
    private final UserAdminService userAdminService;

    /**
    * Obtiene y retorna los datos del usuario autenticado que realiza la solicitud.
    * Retorna campos extendidos (como IDs de perfiles vinculados).
    *
    * @param userDetails Detalles del usuario autenticado en el contexto de seguridad.
    * @return Respuesta HTTP con el DTO del perfil del usuario.
    */
    @GetMapping("/me")
    public ResponseEntity<UserDTO> getMe(@AuthenticationPrincipal UserDetails userDetails) {

        UserDTO userDto = userLookupService.getUserDetails(userDetails.getUsername());

        UserDTO finalDto = UserDTO.builder()
                .id(userDto.getId())
                .firstname(userDto.getFirstname())
                .lastname(userDto.getLastname())
                .email(userDto.getEmail())
                .role(userDto.getRole())
                .clientId(userDto.getClientId())
                .employeeId(userDto.getEmployeeId())
                .workshopId(userDto.getWorkshopId())
                .build();

        return ResponseEntity.ok(finalDto);
    }

    /**
    * Cambia la contraseña del usuario logueado tras validar la contraseña actual.
    *
    * @param request Datos de la petición con la contraseña actual y la nueva contraseña.
    * @param userDetails Detalles del usuario autenticado.
    * @return Respuesta HTTP con un mensaje de éxito.
    */
    @PostMapping("/change-password")
    public ResponseEntity<String> changePassword(
            @Valid @RequestBody ChangePasswordRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        userAdminService.changePassword(userDetails.getUsername(), request);
        return ResponseEntity.ok("Contraseña cambiada correctamente.");
    }

    /**
     * Da de baja y elimina por completo la cuenta y el perfil del usuario autenticado del sistema,
     * liberando los recursos asociados.
     *
     * @param userDetails Detalles del usuario autenticado.
     * @return Respuesta HTTP con confirmación del borrado.
     */
    @DeleteMapping("/me")
    public ResponseEntity<String> deleteMe(@AuthenticationPrincipal UserDetails userDetails) {
        userAdminService.deleteUser(userDetails.getUsername());
        return ResponseEntity.ok("Usuario eliminado correctamente.");
    }
}