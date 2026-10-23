package de.jan.controller;

import de.jan.controller.response.LicenseResponse;
import de.jan.license.LicenseRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * The open source libraries of the backend, for the page "Open-Source-Lizenzen". Public.
 */
@Tag(name = "licenses")
@RestController
@RequestMapping("/api/licenses")
public class LicenseController {

    private final LicenseRepository licenseRepository;

    private static final String LIST_BACKEND_LICENSES = "listBackendLicenses";

    public LicenseController(LicenseRepository licenseRepository) {
        this.licenseRepository = licenseRepository;
    }

    @Operation(operationId = LIST_BACKEND_LICENSES)
    @GetMapping("/backend")
    public ResponseEntity<List<LicenseResponse>> listBackendLicenses() {
        return ResponseEntity.ok(licenseRepository.getAll());
    }
}
