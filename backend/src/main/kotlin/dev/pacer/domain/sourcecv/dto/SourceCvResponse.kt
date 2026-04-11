package dev.pacer.domain.sourcecv.dto

import tools.jackson.databind.JsonNode
import tools.jackson.databind.ObjectMapper
import dev.pacer.domain.sourcecv.SourceCv
import java.time.Instant
import java.util.UUID

data class SourceCvResponse(
    val id: UUID?,
    val version: Int?,
    val label: String?,
    val data: JsonNode,
    val updatedAt: Instant?,
) {
    companion object {
        fun from(cv: SourceCv, objectMapper: ObjectMapper) = SourceCvResponse(
            id = cv.id,
            version = cv.version,
            label = cv.label,
            data = objectMapper.readTree(cv.data),
            updatedAt = cv.updatedAt,
        )

        fun empty(objectMapper: ObjectMapper) = SourceCvResponse(
            id = null,
            version = null,
            label = null,
            data = objectMapper.readTree("""{"sections":[]}"""),
            updatedAt = null,
        )
    }
}
