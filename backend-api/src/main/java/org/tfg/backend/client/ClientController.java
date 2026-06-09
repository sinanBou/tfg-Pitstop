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

    /**
    * Endpoint de bÃºsqueda general y paginada de clientes.
    *
    * @param query Texto o tÃ©rmino por el cual filtrar (NIF, nombre, email).
    * @param page NÃºmero de pÃ¡gina (comienza en 0).
    * @param size Cantidad de elementos por pÃ¡gina.
    * @return ResponseEntity con la pÃ¡gina de resultados {@link ClientSearchDTO}.
    */
    @GetMapping("/search")
    public ResponseEntity<Page<ClientSearchDTO>> search(
            @RequestParam(defaultValue = "") String query,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(clientService.searchClientsPaginated(query, page, size));
    }

    /**
    * Registra manualmente un cliente en el sistema sin requerir proceso de registro pÃºblico.
    *
    * @param request Datos bÃ¡sicos del cliente a registrar.
    * @return ResponseEntity con el DTO simplificado del cliente registrado.
    */
    @PostMapping("/manual-register")
    public ResponseEntity<ClientSearchDTO> manualRegister(@RequestBody ClientSearchDTO request) {
        return ResponseEntity.ok(clientService.registerManualClient(request));
    }

    /**
    * Obtiene el perfil completo del cliente autenticado actual.
    *
    * @param user Usuario autenticado (obtenido del principal de seguridad).
    * @return ResponseEntity conteniendo el {@link ClientDTO} con el perfil del cliente.
    */
    @PutMapping("/me")
    public ResponseEntity<ClientDTO> updateMe(
            @AuthenticationPrincipal User user,
            @RequestBody ClientDTO request) {
        return ResponseEntity.ok(clientService.updateProfile(user.getEmail(), request));
    }
}