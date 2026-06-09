package org.tfg.backend.storage;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.GetObjectPresignRequest;
import software.amazon.awssdk.services.s3.presigner.model.PresignedGetObjectRequest;

import java.io.IOException;
import java.time.Duration;
import java.util.UUID;

/**
 * Implementación de {@link StorageService} basada en Amazon S3.
 * Permite gestionar la subida y borrado de archivos, así como la generación de URLs prefirmadas
 * con validez temporal de 60 minutos para mayor seguridad en el acceso a archivos multimedia.
 */
@Service
public class S3StorageService implements StorageService {

    private final S3Client s3Client;
    private final S3Presigner s3Presigner;
    private final String bucketName;
    private final String region;

    /**
     * Constructor que inyecta las dependencias necesarias de AWS S3.
     *
     * @param s3Client Cliente para operaciones estándar en S3.
     * @param s3Presigner Firmador para generar URLs temporales.
     * @param bucketName Nombre del bucket S3 configurado.
     * @param region Región de AWS donde se aloja el bucket.
     */
    public S3StorageService(S3Client s3Client,
                            S3Presigner s3Presigner,
                            @Value("${aws.s3.bucket}") String bucketName,
                            @Value("${aws.region}") String region) {
        this.s3Client = s3Client;
        this.s3Presigner = s3Presigner;
        this.bucketName = bucketName;
        this.region = region;
    }

    /**
     * Sube un archivo a un bucket S3. Genera un nombre de archivo único con un UUID
     * para evitar colisiones y mantiene la extensión original.
     *
     * @param file Archivo multipart enviado por el cliente.
     * @param folder Carpeta o prefijo de destino en S3.
     * @return URL absoluta del archivo almacenado.
     * @throws IOException Si ocurre un error al leer el flujo de entrada del archivo.
     */
    @Override
    public String uploadFile(MultipartFile file, String folder) throws IOException {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("No se puede subir un archivo vacío");
        }

        String originalFilename = file.getOriginalFilename();
        String extension = "";
        if (originalFilename != null && originalFilename.contains(".")) {
            extension = originalFilename.substring(originalFilename.lastIndexOf("."));
        }
        String fileName = folder + "/" + UUID.randomUUID().toString() + extension;

        PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                 .bucket(bucketName)
                 .key(fileName)
                 .contentType(file.getContentType())
                 .build();

        s3Client.putObject(putObjectRequest, RequestBody.fromInputStream(file.getInputStream(), file.getSize()));

        return String.format("https://%s.s3.%s.amazonaws.com/%s", bucketName, region, fileName);
    }

    /**
     * Elimina un archivo de S3 a partir de su URL absoluta.
     * Extrae el key (ruta de S3) de la URL antes de ejecutar la petición de borrado.
     *
     * @param fileUrl URL absoluta del archivo en S3.
     */
    @Override
    public void deleteFile(String fileUrl) {
        if (fileUrl == null || !fileUrl.contains(".amazonaws.com/")) {
            return;
        }

        try {
            String key = fileUrl.substring(fileUrl.indexOf(".amazonaws.com/") + 15);
            DeleteObjectRequest deleteObjectRequest = DeleteObjectRequest.builder()
                    .bucket(bucketName)
                    .key(key)
                    .build();
            s3Client.deleteObject(deleteObjectRequest);
        } catch (Exception e) {
            System.err.println("Error deleting file from S3: " + e.getMessage());
        }
    }

    /**
     * Genera una URL prefirmada con una validez de 60 minutos para el archivo especificado.
     * Si la URL provista no corresponde al formato de S3 de AWS, se retorna la misma sin modificar.
     *
     * @param fileUrl URL absoluta del archivo en S3.
     * @return URL prefirmada temporal para visualización segura, o la URL original si ocurre un error.
     */
    @Override
    public String generatePresignedUrl(String fileUrl) {
        if (fileUrl == null || !fileUrl.contains(".amazonaws.com/")) {
            return fileUrl;
        }

        try {
            String key = fileUrl.substring(fileUrl.indexOf(".amazonaws.com/") + 15);
            GetObjectRequest getObjectRequest = GetObjectRequest.builder()
                    .bucket(bucketName)
                    .key(key)
                    .build();

            GetObjectPresignRequest getObjectPresignRequest = GetObjectPresignRequest.builder()
                    .signatureDuration(Duration.ofMinutes(60))
                    .getObjectRequest(getObjectRequest)
                    .build();

            PresignedGetObjectRequest presignedGetObjectRequest = s3Presigner.presignGetObject(getObjectPresignRequest);
            return presignedGetObjectRequest.url().toString();
        } catch (Exception e) {
            System.err.println("Error generating presigned URL: " + e.getMessage());
            return fileUrl;
        }
    }
}
