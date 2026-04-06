package dev.pacer.domain.sourcecv.dto

import com.fasterxml.jackson.databind.JsonNode

data class UpdateSourceCvRequest(
    val data: JsonNode,
)
