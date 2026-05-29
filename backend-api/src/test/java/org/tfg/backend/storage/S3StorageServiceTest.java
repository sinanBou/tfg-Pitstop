package org.tfg.backend.storage;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;
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
import java.net.URL;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class S3StorageServiceTest {

    @Mock
    private S3Client s3Client;

    @Mock
    private S3Presigner s3Presigner;

    private S3StorageService s3StorageService;
    private final String bucketName = "pitstop-bucket";
    private final String region = "us-east-1";

    @BeforeEach
    void setUp() {
        s3StorageService = new S3StorageService(s3Client, s3Presigner, bucketName, region);
    }

    @Test
    void uploadFile_ShouldUploadSuccessfullyAndReturnUrl() throws IOException {
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "test.jpg",
                "image/jpeg",
                "test image content".getBytes()
        );

        String resultUrl = s3StorageService.uploadFile(file, "avatars");

        assertNotNull(resultUrl);
        assertTrue(resultUrl.startsWith("https://pitstop-bucket.s3.us-east-1.amazonaws.com/avatars/"));
        assertTrue(resultUrl.endsWith(".jpg"));

        verify(s3Client, times(1)).putObject(any(PutObjectRequest.class), any(RequestBody.class));
    }

    @Test
    void uploadFile_ShouldThrowIllegalArgumentExceptionWhenFileIsEmpty() {
        MockMultipartFile emptyFile = new MockMultipartFile(
                "file",
                "empty.jpg",
                "image/jpeg",
                new byte[0]
        );

        assertThrows(IllegalArgumentException.class, () -> s3StorageService.uploadFile(emptyFile, "avatars"));
        verify(s3Client, never()).putObject(any(PutObjectRequest.class), any(RequestBody.class));
    }

    @Test
    void deleteFile_ShouldDeleteSuccessfullyWhenUrlIsValid() {
        String fileUrl = "https://pitstop-bucket.s3.us-east-1.amazonaws.com/avatars/some-uuid.jpg";

        s3StorageService.deleteFile(fileUrl);

        verify(s3Client, times(1)).deleteObject(any(DeleteObjectRequest.class));
    }

    @Test
    void deleteFile_ShouldNotCallS3WhenUrlIsInvalid() {
        s3StorageService.deleteFile("invalid-url");
        s3StorageService.deleteFile(null);

        verify(s3Client, never()).deleteObject(any(DeleteObjectRequest.class));
    }

    @Test
    void generatePresignedUrl_ShouldReturnPresignedUrlWhenUrlIsValid() throws Exception {
        String fileUrl = "https://pitstop-bucket.s3.us-east-1.amazonaws.com/avatars/some-uuid.jpg";
        URL mockUrl = new URL("https://pitstop-bucket.s3.us-east-1.amazonaws.com/avatars/some-uuid.jpg?AWSAccessKeyId=test");

        PresignedGetObjectRequest presignedGetObjectRequest = mock(PresignedGetObjectRequest.class);
        when(presignedGetObjectRequest.url()).thenReturn(mockUrl);
        when(s3Presigner.presignGetObject(any(GetObjectPresignRequest.class))).thenReturn(presignedGetObjectRequest);

        String result = s3StorageService.generatePresignedUrl(fileUrl);

        assertNotNull(result);
        assertEquals(mockUrl.toString(), result);
        verify(s3Presigner, times(1)).presignGetObject(any(GetObjectPresignRequest.class));
    }

    @Test
    void generatePresignedUrl_ShouldReturnOriginalUrlWhenUrlIsInvalid() {
        String invalidUrl = "invalid-url";

        String result = s3StorageService.generatePresignedUrl(invalidUrl);

        assertEquals(invalidUrl, result);
        verify(s3Presigner, never()).presignGetObject(any(GetObjectPresignRequest.class));
    }

    @Test
    void generatePresignedUrl_ShouldReturnOriginalUrlWhenExceptionOccurs() {
        String fileUrl = "https://pitstop-bucket.s3.us-east-1.amazonaws.com/avatars/some-uuid.jpg";
        when(s3Presigner.presignGetObject(any(GetObjectPresignRequest.class))).thenThrow(new RuntimeException("S3 Error"));

        String result = s3StorageService.generatePresignedUrl(fileUrl);

        assertEquals(fileUrl, result);
    }
}
