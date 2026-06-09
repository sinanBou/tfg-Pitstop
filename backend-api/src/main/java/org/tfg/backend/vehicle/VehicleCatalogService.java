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

/**
 * Servicio encargado de proveer la lista oficial y estandarizada de marcas y modelos
 * admitidos en el sistema. Carga los datos de referencia desde el archivo JSON `json_data.json`.
 */
@Service
@RequiredArgsConstructor
public class VehicleCatalogService {

    private final ObjectMapper objectMapper;
    private List<CatalogEntry> catalog;

    /**
     * Clase interna para deserializar las marcas, modelos y años del catálogo.
     */
    @Data
    public static class CatalogEntry {
        private int year;
        private String make;
        private String model;
    }

    /**
     * Carga el archivo JSON con los datos del catálogo de vehículos al arrancar el servicio.
     *
     * @throws IOException Si ocurre un error al leer el recurso JSON.
     */
    @PostConstruct
    public void init() throws IOException {
        InputStream inputStream = new ClassPathResource("json_data.json").getInputStream();
        catalog = objectMapper.readValue(inputStream, new TypeReference<List<CatalogEntry>>() {});
    }

    /**
     * Obtiene el listado de marcas únicas presentes en el catálogo, ordenadas alfabéticamente.
     *
     * @return Lista de nombres de marcas.
     */
    public List<String> getMakes() {
        return catalog.stream()
                .map(CatalogEntry::getMake)
                .distinct()
                .sorted()
                .collect(Collectors.toList());
    }

    /**
     * Obtiene la lista de modelos de vehículos para una marca en particular, ordenados alfabéticamente.
     *
     * @param make Nombre de la marca.
     * @return Lista de nombres de modelos para esa marca.
     */
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
     *
     * @return Lista completa de registros del catálogo.
     */
    public List<CatalogEntry> getFullCatalog() {
        return catalog;
    }
}
