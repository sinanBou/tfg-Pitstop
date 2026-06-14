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

    private final ClientProfileService clientProfileService;
    private final ClientAdminService clientAdminService;

    /**
     * Devuelve el perfil del cliente que ha iniciado sesión.
     */
    @GetMapping("/me")
    public ResponseEntity<ClientDTO> getMe(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(clientProfileService.getClientProfile(user.getEmail()));
    }

    /**
    * Endpoint de búsqueda general y paginada de clientes.
    *
    * @param query Texto o término por el cual filtrar (NIF, nombre, email).
    * @param page Número de página (comienza en 0).
    * @param size Cantidad de elementos por página.
    * @return ResponseEntity con la página de resultados {@link ClientSearchDTO}.
    */
    @GetMapping("/search")
    public ResponseEntity<Page<ClientSearchDTO>> search(
            @RequestParam(defaultValue = "") String query,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(clientAdminService.searchClientsPaginated(query, page, size));
    }

    /**
    * Registra manualmente un cliente en el sistema sin requerir proceso de registro público.
    *
    * @param request Datos básicos del cliente a registrar.
    * @return ResponseEntity con el DTO simplificado del cliente registrado.
    */
    @PostMapping("/manual-register")
    public ResponseEntity<ClientSearchDTO> manualRegister(@RequestBody ClientSearchDTO request) {
        return ResponseEntity.ok(clientAdminService.registerManualClient(request));
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
        return ResponseEntity.ok(clientProfileService.updateProfile(user.getEmail(), request));
    }
}