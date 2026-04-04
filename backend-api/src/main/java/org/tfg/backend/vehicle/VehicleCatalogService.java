package org.tfg.backend.vehicle;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.annotation.PostConstruct;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.io.InputStream;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class VehicleCatalogService {

    private final ObjectMapper objectMapper;
    private List<CatalogEntry> catalog;

    @Data
    public static class CatalogEntry {
        private int year;
        private String make;
        private String model;
    }

    @PostConstruct
    public void init() throws IOException {
        InputStream inputStream = new ClassPathResource("json_data.json").getInputStream();
        catalog = objectMapper.readValue(inputStream, new TypeReference<List<CatalogEntry>>() {});
    }

    public List<String> getMakes() {
        return catalog.stream()
                .map(CatalogEntry::getMake)
                .distinct()
                .sorted()
                .collect(Collectors.toList());
    }

    public List<String> getModels(String make) {
        if (make == null || make.isEmpty()) return Collections.emptyList();
        String upperMake = make.toUpperCase();
        return catalog.stream()
                .filter(entry -> entry.getMake().equalsIgnoreCase(upperMake))
                .map(CatalogEntry::getModel)
                .distinct()
                .sorted()
                .collect(Collectors.toList());
    }

    /**
     * Devuelve toda la información útil para el catálogo si el frontend prefiere tenerla cacheada.
     * Dado que es solo 1MB de JSON, enviarlo todo filtrado por makes podría ser eficiente.
     */
    public List<CatalogEntry> getFullCatalog() {
        return catalog;
    }
}
