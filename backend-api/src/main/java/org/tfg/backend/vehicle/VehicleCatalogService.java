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
 * Servicio encargado de la carga y consulta del catálogo global de marcas y modelos de vehículos.
 * Carga los datos en memoria en el arranque de la aplicación desde un archivo JSON estático (vehicle_catalog.json).
 */
@Service
@RequiredArgsConstructor
public class VehicleCatalogService {

    private final ObjectMapper objectMapper;
    private List<CatalogEntry> catalog;

    /**
     * Clase interna que modela cada entrada del catálogo estático de vehículos.
     */
    @Data
    public static class CatalogEntry {
        private int year;
        private String make;
        private String model;
    }

    /**
     * Inicializa el catálogo leyendo el archivo de recursos "vehicle_catalog.json"
     * y deserializándolo en memoria.
     *
     * @throws IOException si hay problemas leyendo el archivo de recursos.
     */
    @PostConstruct
    public void init() throws IOException {
        InputStream inputStream = new ClassPathResource("vehicle_catalog.json").getInputStream();
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
     * @return Lista completa de todas las entradas del catálogo.
     */
    public List<CatalogEntry> getFullCatalog() {
        return catalog;
    }
}