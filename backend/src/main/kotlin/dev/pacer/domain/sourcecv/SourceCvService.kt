package dev.pacer.domain.sourcecv

import tools.jackson.databind.ObjectMapper
import dev.pacer.domain.sourcecv.dto.CreateVersionRequest
import dev.pacer.domain.sourcecv.dto.SourceCvResponse
import dev.pacer.domain.sourcecv.dto.SourceCvVersionSummary
import dev.pacer.domain.sourcecv.dto.UpdateSourceCvRequest
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.Instant
import java.util.UUID

@Service
class SourceCvService(
    private val sourceCvRepository: SourceCvRepository,
    private val objectMapper: ObjectMapper,
) {

    fun getLatest(userId: UUID): SourceCvResponse {
        val cv = sourceCvRepository.findTopByUserIdOrderByVersionDesc(userId)
        return cv?.let { SourceCvResponse.from(it, objectMapper) }
            ?: SourceCvResponse.empty(objectMapper)
    }

    @Transactional
    fun updateCurrent(userId: UUID, request: UpdateSourceCvRequest): SourceCvResponse {
        val existing = sourceCvRepository.findTopByUserIdOrderByVersionDesc(userId)
        val cv = if (existing == null) {
            SourceCv(userId = userId, data = objectMapper.writeValueAsString(request.data))
        } else {
            existing.data = objectMapper.writeValueAsString(request.data)
            existing.updatedAt = Instant.now()
            existing
        }
        return SourceCvResponse.from(sourceCvRepository.save(cv), objectMapper)
    }

    fun listVersions(userId: UUID): List<SourceCvVersionSummary> =
        sourceCvRepository.findAllByUserIdOrderByVersionDesc(userId)
            .map { SourceCvVersionSummary.from(it) }

    @Transactional
    fun createVersion(userId: UUID, request: CreateVersionRequest): SourceCvVersionSummary {
        val current = sourceCvRepository.findTopByUserIdOrderByVersionDesc(userId)
            ?: throw NoSuchElementException("No Source CV found for user $userId")
        val newVersion = SourceCv(
            userId = userId,
            version = current.version + 1,
            label = request.label,
            data = current.data,
        )
        return SourceCvVersionSummary.from(sourceCvRepository.save(newVersion))
    }

    @Transactional
    fun restore(userId: UUID, versionId: UUID): SourceCvVersionSummary {
        val target = sourceCvRepository.findById(versionId)
            .orElseThrow { NoSuchElementException("Version $versionId not found") }
        require(target.userId == userId) { "Version $versionId does not belong to user $userId" }

        val current = sourceCvRepository.findTopByUserIdOrderByVersionDesc(userId)
        val restored = if (current == null || current.id == target.id) {
            target
        } else {
            SourceCv(
                userId = userId,
                version = current.version + 1,
                label = target.label,
                data = target.data,
            )
        }
        return SourceCvVersionSummary.from(sourceCvRepository.save(restored))
    }
}
