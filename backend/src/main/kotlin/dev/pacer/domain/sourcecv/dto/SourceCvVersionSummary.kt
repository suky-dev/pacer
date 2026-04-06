package dev.pacer.domain.sourcecv.dto

import dev.pacer.domain.sourcecv.SourceCv
import java.time.Instant
import java.util.UUID

data class SourceCvVersionSummary(
    val id: UUID,
    val version: Int,
    val label: String?,
    val updatedAt: Instant,
) {
    companion object {
        fun from(cv: SourceCv) = SourceCvVersionSummary(
            id = cv.id!!,
            version = cv.version,
            label = cv.label,
            updatedAt = cv.updatedAt,
        )
    }
}
