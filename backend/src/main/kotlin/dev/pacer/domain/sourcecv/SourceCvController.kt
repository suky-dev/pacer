package dev.pacer.domain.sourcecv

import dev.pacer.domain.sourcecv.dto.CreateVersionRequest
import dev.pacer.domain.sourcecv.dto.SourceCvResponse
import dev.pacer.domain.sourcecv.dto.SourceCvVersionSummary
import dev.pacer.domain.sourcecv.dto.UpdateSourceCvRequest
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.security.oauth2.jwt.Jwt
import org.springframework.web.bind.annotation.*
import java.util.UUID

@RestController
@RequestMapping("/api/users/me/source-cv")
class SourceCvController(private val sourceCvService: SourceCvService) {

    @GetMapping
    fun getLatest(@AuthenticationPrincipal jwt: Jwt): SourceCvResponse {
        val userId = UUID.fromString(jwt.subject)
        return sourceCvService.getLatest(userId)
    }

    @PutMapping
    fun updateCurrent(
        @AuthenticationPrincipal jwt: Jwt,
        @RequestBody request: UpdateSourceCvRequest,
    ): SourceCvResponse {
        val userId = UUID.fromString(jwt.subject)
        return sourceCvService.updateCurrent(userId, request)
    }

    @GetMapping("/versions")
    fun listVersions(@AuthenticationPrincipal jwt: Jwt): List<SourceCvVersionSummary> {
        val userId = UUID.fromString(jwt.subject)
        return sourceCvService.listVersions(userId)
    }

    @PostMapping("/versions")
    fun createVersion(
        @AuthenticationPrincipal jwt: Jwt,
        @RequestBody request: CreateVersionRequest,
    ): SourceCvVersionSummary {
        val userId = UUID.fromString(jwt.subject)
        return sourceCvService.createVersion(userId, request)
    }

    @PostMapping("/versions/{id}/restore")
    fun restore(
        @AuthenticationPrincipal jwt: Jwt,
        @PathVariable id: UUID,
    ): SourceCvVersionSummary {
        val userId = UUID.fromString(jwt.subject)
        return sourceCvService.restore(userId, id)
    }
}
