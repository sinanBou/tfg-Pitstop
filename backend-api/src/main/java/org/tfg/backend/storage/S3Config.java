package org.tfg.backend.storage;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;

/**
 * Configuración de persistencia y cliente AWS S3 para el almacenamiento de archivos (como imágenes de perfil).
 * Configura los Beans de S3Client y S3Presigner utilizando credenciales estáticas de AWS provistas por variables de entorno.
 */
@Configuration
public class S3Config {

    @Value("${aws.access.key.id}")
    private String accessKey;

    @Value("${aws.secret.access.key}")
    private String secretKey;

    @Value("${aws.region}")
    private String region;

    /**
     * Instancia el cliente síncrono S3Client para realizar subidas, descargas y borrados
     * directos en el bucket de S3.
     *
     * @return El cliente S3Client configurado.
     */
    @Bean
    public S3Client s3Client() {
        return S3Client.builder()
                .region(Region.of(region))
                .credentialsProvider(StaticCredentialsProvider.create(
                        AwsBasicCredentials.create(accessKey, secretKey)
                ))
                .build();
    }

    /**
     * Instancia el generador de URLs firmadas S3Presigner para permitir accesos temporales seguros
     * a las imágenes privadas del bucket de S3 desde el cliente web.
     *
     * @return El S3Presigner configurado.
     */
    @Bean
    public software.amazon.awssdk.services.s3.presigner.S3Presigner s3Presigner() {
        return software.amazon.awssdk.services.s3.presigner.S3Presigner.builder()
                .region(Region.of(region))
                .credentialsProvider(StaticCredentialsProvider.create(
                        AwsBasicCredentials.create(accessKey, secretKey)
                ))
                .build();
    }
}
