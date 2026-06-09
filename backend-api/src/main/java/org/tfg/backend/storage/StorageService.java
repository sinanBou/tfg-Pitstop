package org.tfg.backend.storage;

import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;

/**
* Interfaz que define el contrato para los servicios de almacenamiento de archivos.
* Permite subir archivos de imagen, borrarlos y generar enlaces de lectura temporales.
*/
public interface StorageService {

    String uploadFile(MultipartFile file, String folder) throws IOException;


    /**
    * Elimina el archivo especificado por su URL del sistema de almacenamiento.
    *
    * @param fileUrl URL completa del archivo que se desea eliminar.
    */
    void deleteFile(String fileUrl);

    String generatePresignedUrl(String fileUrl);
}