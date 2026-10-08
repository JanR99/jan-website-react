package de.jan.controller;

import de.jan.backup.BackupRepository;
import de.jan.role.Permission;
import de.jan.security.Authorization;
import de.jan.security.CurrentUser;
import de.jan.user.User;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;

/**
 * The backup of the recipes and the travel diary as a file to download.
 */
@Tag(name = "backup")
@RestController
@RequestMapping("/api/backup")
public class BackupController {

    private final BackupRepository backupRepository;

    private static final String EXPORT_BACKUP = "exportBackup";

    public BackupController(BackupRepository backupRepository) {
        this.backupRepository = backupRepository;
    }

    /**
     * A ZIP file with all recipes, travel folders and their images. It is written straight into the
     * response instead of being returned as a whole: with all images in it, it is too large to be
     * held in memory, and Cloud Run sends more than 32 MB only as a stream.
     */
    @Operation(operationId = EXPORT_BACKUP)
    @GetMapping("/export")
    public void exportBackup(@CurrentUser User user, HttpServletResponse response) throws IOException {
        Authorization.with(user).require(Permission.EXPORT_DATA);
        response.setContentType("application/zip");
        response.setHeader(HttpHeaders.CONTENT_DISPOSITION,
                ContentDisposition.attachment().filename(backupRepository.fileName()).build().toString());
        backupRepository.writeBackup(response.getOutputStream());
    }
}
