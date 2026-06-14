package org.tfg.backend.vehicle;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;


@RestController
@RequestMapping("/api/vehicles")
@RequiredArgsConstructor
public class VehicleController {

    private final VehicleAdminService vehicleAdminService;
    private final VehicleProfileService vehicleProfileService;
    private final VehicleCatalogService catalogService;

    /**
    * Obtiene todas las marcas registradas en el catálogo oficial de vehículos.
    *
    * @return Respuesta HTTP con la lista de marcas.
    */
    @GetMapping("/catalog/makes")
    public ResponseEntity<List<String>> getCatalogMakes() {
        return ResponseEntity.ok(catalogService.getMakes());
    }

    /**
    * Obtiene todos los modelos asociados a una marca en el catálogo.
    *
    * @param make Nombre de la marca.
    * @return Respuesta HTTP con la lista de modelos.
    */
    @GetMapping("/catalog/models/{make}")
    public ResponseEntity<List<String>> getCatalogModels(@PathVariable String make) {
        return ResponseEntity.ok(catalogService.getModels(make));
    }


    // Recibe un REQUEST
    /**
    * Registra un nuevo vehículo para el cliente autenticado.
    *
    * @param request Datos del vehículo (marca, modelo, matrícula, etc.).
    * @param userDetails Detalles del usuario autenticado en la sesión.
    * @return Respuesta HTTP con el DTO del vehículo registrado.
    */
    @PostMapping("/register")
    public ResponseEntity<VehicleDTO> register(@RequestBody VehicleRequest request,
                                               @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(vehicleProfileService.registerVehicle(request, userDetails.getUsername()));
    }

    // Devuelve una lista de DTOs
    /**
    * Lista todos los vehículos que pertenecen al cliente logueado.
    *
    * @param userDetails Detalles del usuario autenticado.
    * @return Respuesta HTTP con la lista de vehículos del cliente.
    */
    @GetMapping("/my-vehicles")
    public ResponseEntity<List<VehicleDTO>> getMyVehicles(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(vehicleProfileService.getVehiclesByClient(userDetails.getUsername()));
    }

    /**
    * Busca vehículos en el sistema utilizando su número de matrícula.
    *
    * @param licensePlate Matrícula del vehículo a buscar.
    * @return Respuesta HTTP con la lista de vehículos que coinciden.
    */
    @GetMapping("/search")
    public ResponseEntity<List<VehicleSearchDTO>> search(@RequestParam String licensePlate) {
        return ResponseEntity.ok(vehicleAdminService.searchVehicles(licensePlate));
    }

    /**
    * Obtiene los vehículos asociados a un cliente específico dado su ID de perfil.
    *
    * @param clientId Identificador único del cliente.
    * @return Respuesta HTTP con la lista de vehículos asociados.
    */
    @GetMapping("/client/{clientId}")
    public ResponseEntity<List<VehicleSearchDTO>> getVehiclesByClientId(@PathVariable UUID clientId) {
        return ResponseEntity.ok(vehicleAdminService.getVehiclesByClientId(clientId));
    }

    /**
    * Registra un vehículo en nombre de un cliente (acción realizada por el personal del taller).
    *
    * @param clientId Identificador del cliente.
    * @param request Datos del vehículo a registrar.
    * @return Respuesta HTTP con el vehículo registrado.
    */
    @PostMapping("/register-for-client/{clientId}")
    public ResponseEntity<VehicleSearchDTO> registerForClient(@PathVariable UUID clientId, @RequestBody VehicleRequest request) {
        return ResponseEntity.ok(vehicleAdminService.registerVehicleForClient(clientId, request));
    }

    /**
    * Elimina un vehículo del sistema y sus citas asociadas si pertenecen al cliente autenticado.
    *
    * @param id Identificador único del vehículo a borrar.
    * @param userDetails Detalles del usuario autenticado.
    * @return Respuesta HTTP sin contenido indicando éxito.
    */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteVehicle(@PathVariable UUID id,
                                              @AuthenticationPrincipal UserDetails userDetails) {
        vehicleProfileService.deleteVehicle(id, userDetails.getUsername());
        return ResponseEntity.noContent().build();
    }
}