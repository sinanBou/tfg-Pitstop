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

    private final VehicleProfileService vehicleProfileService;
    private final VehicleAdminService vehicleAdminService;
    private final VehicleCatalogService catalogService;

    @GetMapping("/catalog/makes")
    public ResponseEntity<List<String>> getCatalogMakes() {
        return ResponseEntity.ok(catalogService.getMakes());
    }

    @GetMapping("/catalog/models/{make}")
    public ResponseEntity<List<String>> getCatalogModels(@PathVariable String make) {
        return ResponseEntity.ok(catalogService.getModels(make));
    }

    @PostMapping("/register")
    public ResponseEntity<VehicleDTO> register(
            @RequestBody VehicleRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(vehicleProfileService.registerVehicle(request, userDetails.getUsername()));
    }

    @GetMapping("/my-vehicles")
    public ResponseEntity<List<VehicleDTO>> getMyVehicles(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(vehicleProfileService.getVehiclesByClient(userDetails.getUsername()));
    }

    @GetMapping("/search")
    public ResponseEntity<List<VehicleSearchDTO>> search(@RequestParam String licensePlate) {
        return ResponseEntity.ok(vehicleAdminService.searchVehicles(licensePlate));
    }

    @GetMapping("/client/{clientId}")
    public ResponseEntity<List<VehicleSearchDTO>> getVehiclesByClientId(@PathVariable UUID clientId) {
        return ResponseEntity.ok(vehicleAdminService.getVehiclesByClientId(clientId));
    }

    @PostMapping("/register-for-client/{clientId}")
    public ResponseEntity<VehicleSearchDTO> registerForClient(
            @PathVariable UUID clientId,
            @RequestBody VehicleRequest request) {
        return ResponseEntity.ok(vehicleAdminService.registerVehicleForClient(clientId, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteVehicle(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserDetails userDetails) {
        vehicleProfileService.deleteVehicle(id, userDetails.getUsername());
        return ResponseEntity.noContent().build();
    }
}