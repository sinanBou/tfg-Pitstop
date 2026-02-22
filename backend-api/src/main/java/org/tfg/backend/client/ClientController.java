package org.tfg.backend.client;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.tfg.backend.user.User;

@RestController
@RequestMapping("/api/v1/clients")
@RequiredArgsConstructor
public class ClientController {

    private final ClientService clientService;

    /**
     * Devuelve el perfil del cliente que ha iniciado sesión.
     */
    @GetMapping("/me")
    public ResponseEntity<ClientDTO> getMe(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(clientService.getClientProfile(user.getEmail()));
    }
}