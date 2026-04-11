package dev.pacer.domain.sourcecv

import org.springframework.data.jpa.repository.JpaRepository
import java.util.UUID

interface SourceCvRepository : JpaRepository<SourceCv, UUID> {
    fun findTopByUserIdOrderByVersionDesc(userId: UUID): SourceCv?
    fun findAllByUserIdOrderByVersionDesc(userId: UUID): List<SourceCv>
}
