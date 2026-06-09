package org.tfg.backend.user;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    /**
    * Obtiene y retorna los datos del usuario autenticado que realiza la solicitud.
    * Retorna campos extendidos (como IDs de perfiles vinculados).
    *
    * @param userDetails Detalles del usuario autenticado en el contexto de seguridad.
    * @return Respuesta HTTP con el DTO del perfil del usuario.
    */
    @GetMapping("/me")
    public ResponseEntity<UserDTO> getMe(@AuthenticationPrincipal UserDetails userDetails) {

        UserDTO userDto = userService.getUserDetails(userDetails.getUsername());

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
        userService.changePassword(userDetails.getUsername(), request);
        return ResponseEntity.ok("Contraseña cambiada correctamente.");
    }

    @DeleteMapping("/me")
    public ResponseEntity<String> deleteMe(@AuthenticationPrincipal UserDetails userDetails) {
        userService.deleteUser(userDetails.getUsername());
        return ResponseEntity.ok("Usuario eliminado correctamente.");
    }
}