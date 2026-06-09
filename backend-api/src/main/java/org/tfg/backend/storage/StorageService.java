package org.tfg.backend.storage;

import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;

/**
 * Interfaz que define el contrato para los servicios de almacenamiento de archivos.
 * Permite subir archivos de imagen, borrarlos y generar enlaces de lectura temporales.
 */
public interface StorageService {

    /**
     * Sube un archivo a un directorio o carpeta del almacenamiento.
     *
     * @param file Archivo a subir.
     * @param folder Nombre de la carpeta de destino.
     * @return URL de referencia del archivo subido.
     * @throws IOException Si ocurre un error durante el procesamiento del archivo.
     */
    String uploadFile(MultipartFile file, String folder) throws IOException;

    /**
     * Elimina el archivo especificado por su URL del sistema de almacenamiento.
     *
     * @param fileUrl URL completa del archivo que se desea eliminar.
     */
    void deleteFile(String fileUrl);

    /**
     * Genera una URL prefirmada con un tiempo de expiración determinado para acceder de forma segura a archivos privados.
     *
     * @param fileUrl URL base del archivo.
     * @return URL prefirmada generada con permisos de lectura, o la URL original si no aplica.
     */
    String generatePresignedUrl(String fileUrl);
}
