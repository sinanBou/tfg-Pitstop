package org.tfg.backend.storage;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;

/**
 * Configuración de cliente para el servicio AWS S3.
 * Configura los Beans de {@link S3Client} para almacenamiento de objetos
 * y {@link S3Presigner} para la generación de URLs de acceso con validez temporal.
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
     * Construye y proporciona el cliente de Amazon S3 con credenciales básicas estáticas.
     *
     * @return Instancia configurada de S3Client.
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
     * Construye y proporciona el firmador de S3 (S3Presigner) para la generación de enlaces de lectura temporales.
     *
     * @return Instancia configurada de S3Presigner.
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
