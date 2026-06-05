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