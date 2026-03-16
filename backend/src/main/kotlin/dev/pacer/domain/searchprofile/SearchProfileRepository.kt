package dev.pacer.domain.searchprofile

import org.springframework.data.jpa.repository.JpaRepository
import java.util.UUID

interface SearchProfileRepository : JpaRepository<SearchProfile, UUID> {
    fun findAllByIsActiveTrue(): List<SearchProfile>
}
