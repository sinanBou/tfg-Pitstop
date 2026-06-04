package org.tfg.backend.taskcatalog;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.tfg.backend.workshop.Workshop;
import org.tfg.backend.workshop.WorkshopRepository;

import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class CatalogDataSeeder implements CommandLineRunner {

    private final WorkshopRepository workshopRepository;
    private final TaskCategoryRepository categoryRepository;
    private final CatalogInitializationService initializationService;
    private final org.tfg.backend.part.service.PartAdminService partAdminService;
    private final org.tfg.backend.part.PartCategoryRepository partCategoryRepository;

    @Override
    public void run(String... args) {
        log.info("Verificando catálogos de talleres registrados...");
        List<Workshop> workshops = workshopRepository.findAll();
        for (Workshop workshop : workshops) {
            boolean hasCategories = !categoryRepository.findByWorkshopIdOrderByNameAsc(workshop.getId()).isEmpty();
            if (!hasCategories) {
                log.info("El taller {} no tiene catálogo. Inicializando catálogo por defecto...", workshop.getCompanyName());
                initializationService.initializeCatalogForWorkshop(workshop);
            }

            boolean hasPartCategories = !partCategoryRepository.findByWorkshopId(workshop.getId()).isEmpty();
            if (!hasPartCategories) {
                log.info("El taller {} no tiene catálogo de repuestos. Inicializando...", workshop.getCompanyName());
                partAdminService.initializeInventoryForWorkshop(workshop);
            }
        }
    }
}
