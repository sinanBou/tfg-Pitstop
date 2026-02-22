package org.tfg.backend.vehicle;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.tfg.backend.vehicle.VehicleDTO;
import org.tfg.backend.vehicle.VehicleRequest;
import org.tfg.backend.vehicle.VehicleService;

import java.util.List;

@RestController
@RequestMapping("/api/vehicles")
@RequiredArgsConstructor
public class VehicleController {

    private final VehicleService vehicleService;

    // Recibe un REQUEST
    @PostMapping("/register")
    public ResponseEntity<VehicleDTO> register(@RequestBody VehicleRequest request,
                                               @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(vehicleService.registerVehicle(request, userDetails.getUsername()));
    }

    // Devuelve una lista de DTOs
    @GetMapping("/my-vehicles")
    public ResponseEntity<List<VehicleDTO>> getMyVehicles(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(vehicleService.getVehiclesByClient(userDetails.getUsername()));
    }
}