package org.tfg.backend.client;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.tfg.backend.user.User;
import org.springframework.web.bind.annotation.*;
import java.util.List;


@RestController
@RequestMapping("/api/clients")
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

    @GetMapping("/search")
    public ResponseEntity<Page<ClientSearchDTO>> search(
            @RequestParam(defaultValue = "") String query,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(clientService.searchClientsPaginated(query, page, size));
    }

    @PostMapping("/manual-register")
    public ResponseEntity<ClientSearchDTO> manualRegister(@RequestBody ClientSearchDTO request) {
        return ResponseEntity.ok(clientService.registerManualClient(request));
    }

    @PutMapping("/me")
    public ResponseEntity<ClientDTO> updateMe(
            @AuthenticationPrincipal User user,
            @RequestBody ClientDTO request) {
        return ResponseEntity.ok(clientService.updateProfile(user.getEmail(), request));
    }
}