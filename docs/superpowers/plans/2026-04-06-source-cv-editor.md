# Source CV Editor — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a Source CV editor where users can write their full career history as a recursive tree of sections and fields, each with multiple variations, stored as JSONB with versioning.

**Architecture:** `source_cvs` table stores one row per version (append-only for explicit checkpoints, upsert for auto-save). Backend exposes 5 REST endpoints under `/api/users/me/source-cv`. Frontend renders a recursive inline-tree editor with 5-second debounced auto-save.

**Tech Stack:** Kotlin + Spring Boot 4, PostgreSQL JSONB, Flyway, Jackson `JsonNode`, Next.js 15, React, TypeScript, shadcn/ui

**Spec:** `docs/superpowers/specs/2026-04-06-source-cv-editor-design.md`

---

## File Map

**Backend — create:**
- `backend/src/main/resources/db/migration/V3__add_source_cvs_table.sql`
- `backend/src/main/kotlin/dev/pacer/domain/sourcecv/SourceCv.kt`
- `backend/src/main/kotlin/dev/pacer/domain/sourcecv/SourceCvRepository.kt`
- `backend/src/main/kotlin/dev/pacer/domain/sourcecv/dto/SourceCvResponse.kt`
- `backend/src/main/kotlin/dev/pacer/domain/sourcecv/dto/SourceCvVersionSummary.kt`
- `backend/src/main/kotlin/dev/pacer/domain/sourcecv/dto/UpdateSourceCvRequest.kt`
- `backend/src/main/kotlin/dev/pacer/domain/sourcecv/dto/CreateVersionRequest.kt`
- `backend/src/main/kotlin/dev/pacer/domain/sourcecv/SourceCvService.kt`
- `backend/src/main/kotlin/dev/pacer/domain/sourcecv/SourceCvController.kt`
- `backend/src/test/kotlin/dev/pacer/domain/sourcecv/SourceCvRepositoryTest.kt`

**Frontend — create:**
- `frontend/lib/source-cv.ts` — TypeScript types + API functions
- `frontend/components/source-cv/VariationChip.tsx`
- `frontend/components/source-cv/FieldRow.tsx`
- `frontend/components/source-cv/SectionBlock.tsx`
- `frontend/components/source-cv/NodeList.tsx`
- `frontend/components/source-cv/SourceCvEditor.tsx`
- `frontend/components/source-cv/SourceCvHeader.tsx`
- `frontend/app/source-cv/page.tsx`

**Frontend — modify:**
- `frontend/components/header.tsx` — add Source CV nav link

---

## Task 1: DB Migration

**Files:**
- Create: `backend/src/main/resources/db/migration/V3__add_source_cvs_table.sql`

- [ ] **Step 1: Write the migration**

```sql
CREATE TABLE source_cvs (
    id          UUID         PRIMARY KEY,
    user_id     UUID         NOT NULL REFERENCES users(id),
    version     INT          NOT NULL DEFAULT 1,
    label       VARCHAR(255),
    data        JSONB        NOT NULL DEFAULT '{"sections":[]}',
    created_at  TIMESTAMPTZ  NOT NULL,
    updated_at  TIMESTAMPTZ  NOT NULL,
    UNIQUE (user_id, version)
);
```

- [ ] **Step 2: Run the backend to verify Flyway applies the migration**

```bash
cd backend && ./gradlew bootRun
```

Expected: server starts without Flyway errors. Check logs for `Successfully applied 1 migration to schema "public"`.

- [ ] **Step 3: Commit**

```bash
git add backend/src/main/resources/db/migration/V3__add_source_cvs_table.sql
git commit -m "feat: add source_cvs migration"
```

---

## Task 2: Entity + Repository

**Files:**
- Create: `backend/src/main/kotlin/dev/pacer/domain/sourcecv/SourceCv.kt`
- Create: `backend/src/main/kotlin/dev/pacer/domain/sourcecv/SourceCvRepository.kt`

- [ ] **Step 1: Write the entity**

```kotlin
// SourceCv.kt
package dev.pacer.domain.sourcecv

import jakarta.persistence.*
import org.hibernate.annotations.JdbcTypeCode
import org.hibernate.annotations.UuidGenerator
import org.hibernate.type.SqlTypes
import java.time.Instant
import java.util.UUID

@Entity
@Table(name = "source_cvs")
class SourceCv(
    @Id
    @UuidGenerator(style = UuidGenerator.Style.TIME)
    @GeneratedValue
    val id: UUID? = null,

    @Column(name = "user_id", nullable = false)
    val userId: UUID,

    @Column(nullable = false)
    var version: Int = 1,

    @Column
    var label: String? = null,

    @Column(columnDefinition = "jsonb", nullable = false)
    @JdbcTypeCode(SqlTypes.JSON)
    var data: String = """{"sections":[]}""",

    @Column(name = "created_at", nullable = false)
    val createdAt: Instant = Instant.now(),

    @Column(name = "updated_at", nullable = false)
    var updatedAt: Instant = Instant.now(),
)
```

- [ ] **Step 2: Write the repository**

```kotlin
// SourceCvRepository.kt
package dev.pacer.domain.sourcecv

import org.springframework.data.jpa.repository.JpaRepository
import java.util.UUID

interface SourceCvRepository : JpaRepository<SourceCv, UUID> {
    fun findTopByUserIdOrderByVersionDesc(userId: UUID): SourceCv?
    fun findAllByUserIdOrderByVersionDesc(userId: UUID): List<SourceCv>
}
```

- [ ] **Step 3: Compile to verify**

```bash
cd backend && ./gradlew compileKotlin
```

Expected: BUILD SUCCESSFUL

- [ ] **Step 4: Commit**

```bash
git add backend/src/main/kotlin/dev/pacer/domain/sourcecv/
git commit -m "feat: add SourceCv entity and repository"
```

---

## Task 3: Repository Test

**Files:**
- Create: `backend/src/test/kotlin/dev/pacer/domain/sourcecv/SourceCvRepositoryTest.kt`

- [ ] **Step 1: Write the failing tests**

```kotlin
// SourceCvRepositoryTest.kt
package dev.pacer.domain.sourcecv

import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest
import org.springframework.boot.jdbc.test.autoconfigure.AutoConfigureTestDatabase
import org.springframework.test.context.ActiveProfiles
import java.util.UUID
import kotlin.test.assertEquals
import kotlin.test.assertNotNull
import kotlin.test.assertNull

@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@ActiveProfiles("local")
class SourceCvRepositoryTest {

    @Autowired
    lateinit var repo: SourceCvRepository

    private val userId = UUID.randomUUID()

    @Test
    fun `findTopByUserIdOrderByVersionDesc returns null when no cv exists`() {
        val result = repo.findTopByUserIdOrderByVersionDesc(userId)
        assertNull(result)
    }

    @Test
    fun `findTopByUserIdOrderByVersionDesc returns latest version`() {
        repo.save(SourceCv(userId = userId, version = 1, data = """{"sections":[]}"""))
        repo.save(SourceCv(userId = userId, version = 2, data = """{"sections":["v2"]}"""))

        val result = repo.findTopByUserIdOrderByVersionDesc(userId)

        assertNotNull(result)
        assertEquals(2, result.version)
    }

    @Test
    fun `findAllByUserIdOrderByVersionDesc returns versions in descending order`() {
        repo.save(SourceCv(userId = userId, version = 1))
        repo.save(SourceCv(userId = userId, version = 2))
        repo.save(SourceCv(userId = userId, version = 3))

        val results = repo.findAllByUserIdOrderByVersionDesc(userId)

        assertEquals(listOf(3, 2, 1), results.map { it.version })
    }
}
```

- [ ] **Step 2: Run the tests to verify they fail**

```bash
cd backend && ./gradlew test --tests "dev.pacer.domain.sourcecv.SourceCvRepositoryTest"
```

Expected: FAILED — entity/repo not wired yet (if running before Task 2) or PASS if after Task 2. Either way confirms test runs.

- [ ] **Step 3: Run after Task 2 is complete to verify they pass**

```bash
cd backend && ./gradlew test --tests "dev.pacer.domain.sourcecv.SourceCvRepositoryTest"
```

Expected: 3 tests PASSED

- [ ] **Step 4: Commit**

```bash
git add backend/src/test/kotlin/dev/pacer/domain/sourcecv/SourceCvRepositoryTest.kt
git commit -m "test: add SourceCvRepository tests"
```

---

## Task 4: DTOs

**Files:**
- Create: `backend/src/main/kotlin/dev/pacer/domain/sourcecv/dto/SourceCvResponse.kt`
- Create: `backend/src/main/kotlin/dev/pacer/domain/sourcecv/dto/SourceCvVersionSummary.kt`
- Create: `backend/src/main/kotlin/dev/pacer/domain/sourcecv/dto/UpdateSourceCvRequest.kt`
- Create: `backend/src/main/kotlin/dev/pacer/domain/sourcecv/dto/CreateVersionRequest.kt`

- [ ] **Step 1: Write SourceCvResponse**

```kotlin
// dto/SourceCvResponse.kt
package dev.pacer.domain.sourcecv.dto

import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.ObjectMapper
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
```

- [ ] **Step 2: Write SourceCvVersionSummary**

```kotlin
// dto/SourceCvVersionSummary.kt
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
```

- [ ] **Step 3: Write UpdateSourceCvRequest**

```kotlin
// dto/UpdateSourceCvRequest.kt
package dev.pacer.domain.sourcecv.dto

import com.fasterxml.jackson.databind.JsonNode

data class UpdateSourceCvRequest(
    val data: JsonNode,
)
```

- [ ] **Step 4: Write CreateVersionRequest**

```kotlin
// dto/CreateVersionRequest.kt
package dev.pacer.domain.sourcecv.dto

data class CreateVersionRequest(
    val label: String? = null,
)
```

- [ ] **Step 5: Compile**

```bash
cd backend && ./gradlew compileKotlin
```

Expected: BUILD SUCCESSFUL

- [ ] **Step 6: Commit**

```bash
git add backend/src/main/kotlin/dev/pacer/domain/sourcecv/dto/
git commit -m "feat: add SourceCv DTOs"
```

---

## Task 5: Service

**Files:**
- Create: `backend/src/main/kotlin/dev/pacer/domain/sourcecv/SourceCvService.kt`

- [ ] **Step 1: Write the service**

```kotlin
// SourceCvService.kt
package dev.pacer.domain.sourcecv

import com.fasterxml.jackson.databind.ObjectMapper
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
        val dataStr = objectMapper.writeValueAsString(request.data)
        val current = sourceCvRepository.findTopByUserIdOrderByVersionDesc(userId)
        val saved = if (current == null) {
            sourceCvRepository.save(SourceCv(userId = userId, data = dataStr))
        } else {
            current.data = dataStr
            current.updatedAt = Instant.now()
            sourceCvRepository.save(current)
        }
        return SourceCvResponse.from(saved, objectMapper)
    }

    fun listVersions(userId: UUID): List<SourceCvVersionSummary> =
        sourceCvRepository.findAllByUserIdOrderByVersionDesc(userId)
            .map { SourceCvVersionSummary.from(it) }

    @Transactional
    fun createVersion(userId: UUID, request: CreateVersionRequest): SourceCvVersionSummary {
        val current = sourceCvRepository.findTopByUserIdOrderByVersionDesc(userId)
            ?: throw NoSuchElementException("No source CV found for user: $userId")
        val newVersion = sourceCvRepository.save(
            SourceCv(
                userId = userId,
                version = current.version + 1,
                label = request.label,
                data = current.data,
            )
        )
        return SourceCvVersionSummary.from(newVersion)
    }

    @Transactional
    fun restore(userId: UUID, versionId: UUID): SourceCvVersionSummary {
        val target = sourceCvRepository.findById(versionId)
            .orElseThrow { NoSuchElementException("Version not found: $versionId") }
        require(target.userId == userId) { "Version does not belong to this user" }
        val current = sourceCvRepository.findTopByUserIdOrderByVersionDesc(userId)!!
        val restored = sourceCvRepository.save(
            SourceCv(
                userId = userId,
                version = current.version + 1,
                label = "Restored from v${target.version}",
                data = target.data,
            )
        )
        return SourceCvVersionSummary.from(restored)
    }
}
```

- [ ] **Step 2: Compile**

```bash
cd backend && ./gradlew compileKotlin
```

Expected: BUILD SUCCESSFUL

- [ ] **Step 3: Commit**

```bash
git add backend/src/main/kotlin/dev/pacer/domain/sourcecv/SourceCvService.kt
git commit -m "feat: add SourceCvService"
```

---

## Task 6: Controller

**Files:**
- Create: `backend/src/main/kotlin/dev/pacer/domain/sourcecv/SourceCvController.kt`

- [ ] **Step 1: Write the controller**

```kotlin
// SourceCvController.kt
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
```

- [ ] **Step 2: Confirm SecurityConfig covers the new routes**

The existing `SecurityConfig` has `.requestMatchers("/api/**").authenticated()` — the new `/api/users/me/source-cv/**` endpoints are already covered. No change needed.

- [ ] **Step 3: Run all backend tests**

```bash
cd backend && ./gradlew test
```

Expected: All tests PASS

- [ ] **Step 4: Smoke-test the endpoint manually**

```bash
# Start backend
cd backend && ./gradlew bootRun

# In another terminal — get a JWT by logging in via browser, then:
curl -H "Authorization: Bearer <your-jwt>" http://localhost:8080/api/users/me/source-cv
```

Expected response:
```json
{"id":null,"version":null,"label":null,"data":{"sections":[]},"updatedAt":null}
```

- [ ] **Step 5: Commit**

```bash
git add backend/src/main/kotlin/dev/pacer/domain/sourcecv/SourceCvController.kt
git commit -m "feat: add SourceCvController with 5 endpoints"
```

---

## Task 7: Frontend Types + API

**Files:**
- Create: `frontend/lib/source-cv.ts`

- [ ] **Step 1: Write types and API functions**

```typescript
// frontend/lib/source-cv.ts
import { apiFetch } from '@/lib/api'

export type RenderType =
  | 'header1' | 'header2' | 'header3' | 'header4'
  | 'text' | 'list' | 'table' | 'location' | 'period'

export type Variation = {
  renderType: RenderType
  value: string
}

export type Field = {
  kind: 'field'
  id: string
  type: string
  value: Variation[]
}

export type Section = {
  kind: 'section'
  id: string
  title: Variation[]
  children: Node[]
}

export type Node = Section | Field

export type SourceCvData = {
  sections: Section[]
}

export type SourceCvResponse = {
  id: string | null
  version: number | null
  label: string | null
  data: SourceCvData
  updatedAt: string | null
}

export type VersionSummary = {
  id: string
  version: number
  label: string | null
  updatedAt: string
}

export function emptySourceCv(): SourceCvData {
  return { sections: [] }
}

export async function getSourceCv(): Promise<SourceCvResponse> {
  const res = await apiFetch('/api/users/me/source-cv')
  if (!res.ok) throw new Error('Failed to load Source CV')
  return res.json()
}

export async function putSourceCv(data: SourceCvData): Promise<SourceCvResponse> {
  const res = await apiFetch('/api/users/me/source-cv', {
    method: 'PUT',
    body: JSON.stringify({ data }),
  })
  if (!res.ok) throw new Error('Failed to save Source CV')
  return res.json()
}

export async function getVersions(): Promise<VersionSummary[]> {
  const res = await apiFetch('/api/users/me/source-cv/versions')
  if (!res.ok) throw new Error('Failed to load versions')
  return res.json()
}

export async function createVersion(label?: string): Promise<VersionSummary> {
  const res = await apiFetch('/api/users/me/source-cv/versions', {
    method: 'POST',
    body: JSON.stringify({ label: label ?? null }),
  })
  if (!res.ok) throw new Error('Failed to create version')
  return res.json()
}

export async function restoreVersion(id: string): Promise<VersionSummary> {
  const res = await apiFetch(`/api/users/me/source-cv/versions/${id}/restore`, {
    method: 'POST',
  })
  if (!res.ok) throw new Error('Failed to restore version')
  return res.json()
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/lib/source-cv.ts
git commit -m "feat: add source CV TypeScript types and API functions"
```

---

## Task 8: VariationChip Component

**Files:**
- Create: `frontend/components/source-cv/VariationChip.tsx`

Clicking a chip opens an inline textarea. Tab/blur closes it.

- [ ] **Step 1: Write the component**

```tsx
// frontend/components/source-cv/VariationChip.tsx
'use client'

import { useRef, useEffect } from 'react'
import { RenderType, Variation } from '@/lib/source-cv'
import { X } from 'lucide-react'

const RENDER_TYPES: RenderType[] = [
  'header1', 'header2', 'header3', 'header4',
  'text', 'list', 'table', 'location', 'period',
]

type Props = {
  variation: Variation
  isEditing: boolean
  onEdit: () => void
  onClose: () => void
  onChange: (updated: Variation) => void
  onDelete: () => void
}

export function VariationChip({ variation, isEditing, onEdit, onClose, onChange, onDelete }: Props) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (isEditing) textareaRef.current?.focus()
  }, [isEditing])

  if (isEditing) {
    return (
      <div className="flex flex-col gap-1 rounded border border-border bg-card p-2 w-full">
        <div className="flex items-center gap-2">
          <select
            className="text-xs bg-muted border border-border rounded px-1 py-0.5"
            value={variation.renderType}
            onChange={(e) => onChange({ ...variation, renderType: e.target.value as RenderType })}
          >
            {RENDER_TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
          <button
            className="ml-auto text-muted-foreground hover:text-destructive"
            onClick={onClose}
          >
            <X className="h-3 w-3" />
          </button>
        </div>
        <textarea
          ref={textareaRef}
          className="text-sm bg-transparent resize-none outline-none min-h-[60px] w-full"
          value={variation.value}
          onChange={(e) => onChange({ ...variation, value: e.target.value })}
          onBlur={onClose}
          onKeyDown={(e) => { if (e.key === 'Escape') onClose() }}
        />
      </div>
    )
  }

  return (
    <div className="group flex items-start gap-1">
      <button
        className="flex-1 text-left text-sm px-2 py-1 rounded bg-muted hover:bg-muted/80 truncate"
        onClick={onEdit}
        title={variation.value}
      >
        <span className="text-xs text-muted-foreground mr-1">[{variation.renderType}]</span>
        {variation.value || <span className="text-muted-foreground italic">empty</span>}
      </button>
      <button
        className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive mt-1"
        onClick={onDelete}
      >
        <X className="h-3 w-3" />
      </button>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/components/source-cv/VariationChip.tsx
git commit -m "feat: add VariationChip component"
```

---

## Task 9: FieldRow Component

**Files:**
- Create: `frontend/components/source-cv/FieldRow.tsx`

- [ ] **Step 1: Write the component**

```tsx
// frontend/components/source-cv/FieldRow.tsx
'use client'

import { useState } from 'react'
import { Field, Variation } from '@/lib/source-cv'
import { VariationChip } from './VariationChip'
import { Plus, Trash2 } from 'lucide-react'

type Props = {
  field: Field
  onChange: (updated: Field) => void
  onDelete: () => void
}

export function FieldRow({ field, onChange, onDelete }: Props) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [editingType, setEditingType] = useState(false)

  function updateVariation(index: number, updated: Variation) {
    const next = [...field.value]
    next[index] = updated
    onChange({ ...field, value: next })
  }

  function deleteVariation(index: number) {
    const next = field.value.filter((_, i) => i !== index)
    onChange({ ...field, value: next })
  }

  function addVariation() {
    const next: Variation = { renderType: 'text', value: '' }
    onChange({ ...field, value: [...field.value, next] })
    setEditingIndex(field.value.length)
  }

  return (
    <div className="group flex gap-3 py-1">
      {/* Field type label */}
      <div className="w-24 shrink-0 pt-1">
        {editingType ? (
          <input
            autoFocus
            className="w-full text-xs text-muted-foreground bg-transparent border-b border-border outline-none"
            value={field.type}
            onChange={(e) => onChange({ ...field, type: e.target.value })}
            onBlur={() => setEditingType(false)}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === 'Escape') setEditingType(false) }}
          />
        ) : (
          <button
            className="text-xs text-muted-foreground hover:text-foreground"
            onClick={() => setEditingType(true)}
          >
            {field.type || 'type'}
          </button>
        )}
      </div>

      {/* Variations */}
      <div className="flex-1 flex flex-col gap-1">
        {field.value.map((variation, i) => (
          <VariationChip
            key={i}
            variation={variation}
            isEditing={editingIndex === i}
            onEdit={() => setEditingIndex(i)}
            onClose={() => setEditingIndex(null)}
            onChange={(updated) => updateVariation(i, updated)}
            onDelete={() => deleteVariation(i)}
          />
        ))}
        <button
          className="text-xs text-muted-foreground hover:text-foreground text-left px-2"
          onClick={addVariation}
        >
          <Plus className="h-3 w-3 inline mr-1" />
          variation
        </button>
      </div>

      {/* Delete field */}
      <button
        className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive mt-1 shrink-0"
        onClick={onDelete}
      >
        <Trash2 className="h-3 w-3" />
      </button>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/components/source-cv/FieldRow.tsx
git commit -m "feat: add FieldRow component"
```

---

## Task 10: NodeList + SectionBlock Components

**Files:**
- Create: `frontend/components/source-cv/NodeList.tsx`
- Create: `frontend/components/source-cv/SectionBlock.tsx`

These are mutually recursive — define both before wiring.

- [ ] **Step 1: Write NodeList**

```tsx
// frontend/components/source-cv/NodeList.tsx
'use client'

import { Node, Field, Section } from '@/lib/source-cv'
import { FieldRow } from './FieldRow'
import { SectionBlock } from './SectionBlock'

type Props = {
  nodes: Node[]
  depth: number
  onChange: (nodes: Node[]) => void
}

export function NodeList({ nodes, depth, onChange }: Props) {
  function updateNode(index: number, updated: Node) {
    const next = [...nodes]
    next[index] = updated
    onChange(next)
  }

  function deleteNode(index: number) {
    onChange(nodes.filter((_, i) => i !== index))
  }

  return (
    <div className="flex flex-col gap-1">
      {nodes.map((node, i) =>
        node.kind === 'section' ? (
          <SectionBlock
            key={node.id}
            section={node}
            depth={depth}
            onChange={(updated) => updateNode(i, updated)}
            onDelete={() => deleteNode(i)}
          />
        ) : (
          <FieldRow
            key={node.id}
            field={node}
            onChange={(updated) => updateNode(i, updated as Node)}
            onDelete={() => deleteNode(i)}
          />
        )
      )}
    </div>
  )
}
```

- [ ] **Step 2: Write SectionBlock**

```tsx
// frontend/components/source-cv/SectionBlock.tsx
'use client'

import { useState } from 'react'
import { Section, Field, Variation, Node } from '@/lib/source-cv'
import { NodeList } from './NodeList'
import { VariationChip } from './VariationChip'
import { Plus, ChevronDown, ChevronRight, Trash2 } from 'lucide-react'

// nanoid-lite: generates a short random id without the full nanoid package
function uid() { return Math.random().toString(36).slice(2, 10) }

type Props = {
  section: Section
  depth: number           // 0 = header1, 1 = header2, etc.
  onChange: (updated: Section) => void
  onDelete: () => void
}

export function SectionBlock({ section, depth, onChange, onDelete }: Props) {
  const [collapsed, setCollapsed] = useState(false)
  const [editingTitleIndex, setEditingTitleIndex] = useState<number | null>(null)

  function updateTitle(index: number, updated: Variation) {
    const next = [...section.title]
    next[index] = updated
    onChange({ ...section, title: next })
  }

  function deleteTitleVariation(index: number) {
    onChange({ ...section, title: section.title.filter((_, i) => i !== index) })
  }

  function addTitleVariation() {
    const defaultRenderType = (['header1', 'header2', 'header3', 'header4'] as const)[Math.min(depth, 3)]
    const next: Variation = { renderType: defaultRenderType, value: '' }
    onChange({ ...section, title: [...section.title, next] })
    setEditingTitleIndex(section.title.length)
  }

  function updateChildren(children: Node[]) {
    onChange({ ...section, children })
  }

  function addField() {
    const newField: Field = { kind: 'field', id: uid(), type: 'bullet', value: [] }
    onChange({ ...section, children: [...section.children, newField] })
  }

  function addSection() {
    const newSection: Section = { kind: 'section', id: uid(), title: [], children: [] }
    onChange({ ...section, children: [...section.children, newSection] })
  }

  const headingClass = [
    'text-xl font-bold',
    'text-lg font-semibold',
    'text-base font-medium',
    'text-sm font-medium',
  ][Math.min(depth, 3)]

  return (
    <div className="group py-1">
      {/* Section header */}
      <div className="flex items-start gap-2">
        <button
          className="mt-1 text-muted-foreground shrink-0"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed
            ? <ChevronRight className="h-4 w-4" />
            : <ChevronDown className="h-4 w-4" />}
        </button>

        <div className="flex-1">
          {/* Title variations */}
          <div className={`flex flex-wrap gap-2 items-center ${headingClass}`}>
            {section.title.map((v, i) => (
              <VariationChip
                key={i}
                variation={v}
                isEditing={editingTitleIndex === i}
                onEdit={() => setEditingTitleIndex(i)}
                onClose={() => setEditingTitleIndex(null)}
                onChange={(updated) => updateTitle(i, updated)}
                onDelete={() => deleteTitleVariation(i)}
              />
            ))}
            <button
              className="text-xs text-muted-foreground hover:text-foreground"
              onClick={addTitleVariation}
            >
              {section.title.length === 0 ? '+ title' : '+ var'}
            </button>
          </div>
        </div>

        <button
          className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive mt-1 shrink-0"
          onClick={onDelete}
        >
          <Trash2 className="h-3 w-3" />
        </button>
      </div>

      {/* Children */}
      {!collapsed && (
        <div className="ml-6 mt-1 border-l border-border pl-4">
          <NodeList nodes={section.children} depth={depth + 1} onChange={updateChildren} />
          <div className="flex gap-3 mt-2">
            <button className="text-xs text-muted-foreground hover:text-foreground" onClick={addField}>
              <Plus className="h-3 w-3 inline mr-1" />field
            </button>
            {depth < 3 && (
              <button className="text-xs text-muted-foreground hover:text-foreground" onClick={addSection}>
                <Plus className="h-3 w-3 inline mr-1" />section
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add frontend/components/source-cv/NodeList.tsx frontend/components/source-cv/SectionBlock.tsx
git commit -m "feat: add NodeList and SectionBlock recursive components"
```

---

## Task 11: SourceCvEditor + Auto-save

**Files:**
- Create: `frontend/components/source-cv/SourceCvEditor.tsx`

- [ ] **Step 1: Write the editor**

```tsx
// frontend/components/source-cv/SourceCvEditor.tsx
'use client'

import { useEffect, useRef } from 'react'
import { Section, SourceCvData, Node } from '@/lib/source-cv'
import { NodeList } from './NodeList'
import { Plus } from 'lucide-react'

function uid() { return Math.random().toString(36).slice(2, 10) }

type Props = {
  cv: SourceCvData
  isDirty: boolean
  onChange: (cv: SourceCvData) => void
  onSave: (cv: SourceCvData) => void
}

export function SourceCvEditor({ cv, isDirty, onChange, onSave }: Props) {
  const onSaveRef = useRef(onSave)
  onSaveRef.current = onSave

  // Auto-save: 5 seconds after last change
  useEffect(() => {
    if (!isDirty) return
    const timer = setTimeout(() => onSaveRef.current(cv), 5000)
    return () => clearTimeout(timer)
  }, [cv, isDirty])

  function updateSections(sections: Node[]) {
    onChange({ sections: sections as Section[] })
  }

  function addSection() {
    const newSection: Section = { kind: 'section', id: uid(), title: [], children: [] }
    onChange({ sections: [...cv.sections, newSection] })
  }

  return (
    <div className="space-y-4">
      <NodeList
        nodes={cv.sections}
        depth={0}
        onChange={updateSections}
      />
      <button
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground border border-dashed border-border rounded px-4 py-2 w-full justify-center"
        onClick={addSection}
      >
        <Plus className="h-4 w-4" />
        Add Section
      </button>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/components/source-cv/SourceCvEditor.tsx
git commit -m "feat: add SourceCvEditor with 5s auto-save"
```

---

## Task 12: SourceCvHeader Component

**Files:**
- Create: `frontend/components/source-cv/SourceCvHeader.tsx`

Shows: current version info, last saved time, "Save Version" button, version history dropdown.

- [ ] **Step 1: Write the component**

```tsx
// frontend/components/source-cv/SourceCvHeader.tsx
'use client'

import { useState } from 'react'
import { VersionSummary, createVersion, getVersions, restoreVersion } from '@/lib/source-cv'
import { Button } from '@/components/ui/button'
import { Save, Clock, ChevronDown } from 'lucide-react'
import { toast } from 'sonner'

type Props = {
  currentVersion: number | null
  lastSaved: Date | null
  isSaving: boolean
  versions: VersionSummary[]
  onVersionCreated: (v: VersionSummary) => void
  onRestored: () => void
}

export function SourceCvHeader({
  currentVersion,
  lastSaved,
  isSaving,
  versions,
  onVersionCreated,
  onRestored,
}: Props) {
  const [showHistory, setShowHistory] = useState(false)
  const [savingVersion, setSavingVersion] = useState(false)

  async function handleSaveVersion() {
    setSavingVersion(true)
    try {
      const v = await createVersion()
      onVersionCreated(v)
      toast.success(`Version ${v.version} saved`)
    } catch {
      toast.error('Failed to save version')
    } finally {
      setSavingVersion(false)
    }
  }

  async function handleRestore(id: string, version: number) {
    try {
      await restoreVersion(id)
      toast.success(`Restored from v${version}`)
      onRestored()
      setShowHistory(false)
    } catch {
      toast.error('Failed to restore version')
    }
  }

  return (
    <div className="flex items-center gap-4 pb-4 border-b border-border">
      <div>
        <h1 className="text-2xl font-semibold">Source CV</h1>
        <p className="text-sm text-muted-foreground">
          {isSaving && 'Saving…'}
          {!isSaving && lastSaved && `Saved ${lastSaved.toLocaleTimeString()}`}
          {!isSaving && !lastSaved && (currentVersion ? `v${currentVersion}` : 'Not saved yet')}
        </p>
      </div>

      <div className="ml-auto flex items-center gap-2">
        {/* Version history */}
        {versions.length > 0 && (
          <div className="relative">
            <Button variant="outline" size="sm" onClick={() => setShowHistory(!showHistory)}>
              <Clock className="h-4 w-4 mr-1" />
              History
              <ChevronDown className="h-3 w-3 ml-1" />
            </Button>
            {showHistory && (
              <div className="absolute right-0 top-9 z-10 w-64 rounded-md border border-border bg-card shadow-md">
                {versions.map((v) => (
                  <div
                    key={v.id}
                    className="flex items-center justify-between px-3 py-2 hover:bg-muted text-sm"
                  >
                    <span>
                      v{v.version}{v.label ? ` — ${v.label}` : ''}
                    </span>
                    <button
                      className="text-xs text-muted-foreground hover:text-foreground"
                      onClick={() => handleRestore(v.id, v.version)}
                    >
                      Restore
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <Button size="sm" onClick={handleSaveVersion} disabled={savingVersion}>
          <Save className="h-4 w-4 mr-1" />
          {savingVersion ? 'Saving…' : 'Save Version'}
        </Button>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/components/source-cv/SourceCvHeader.tsx
git commit -m "feat: add SourceCvHeader with version management"
```

---

## Task 13: Source CV Page + Route

**Files:**
- Create: `frontend/app/source-cv/page.tsx`

- [ ] **Step 1: Write the page**

```tsx
// frontend/app/source-cv/page.tsx
'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/auth-provider'
import { Header } from '@/components/header'
import { SourceCvEditor } from '@/components/source-cv/SourceCvEditor'
import { SourceCvHeader } from '@/components/source-cv/SourceCvHeader'
import {
  SourceCvData,
  VersionSummary,
  emptySourceCv,
  getSourceCv,
  getVersions,
  putSourceCv,
} from '@/lib/source-cv'
import { toast } from 'sonner'

export default function SourceCvPage() {
  const router = useRouter()
  const { user, loading } = useAuth()

  const [cv, setCv] = useState<SourceCvData>(emptySourceCv())
  const [currentVersion, setCurrentVersion] = useState<number | null>(null)
  const [versions, setVersions] = useState<VersionSummary[]>([])
  const [isDirty, setIsDirty] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (!loading && !user) router.replace('/login')
  }, [user, loading, router])

  useEffect(() => {
    if (!user) return
    getSourceCv().then((res) => {
      setCv(res.data)
      setCurrentVersion(res.version)
    })
    getVersions().then(setVersions)
  }, [user])

  function handleChange(updated: SourceCvData) {
    setCv(updated)
    setIsDirty(true)
  }

  const handleSave = useCallback(async (data: SourceCvData) => {
    setIsSaving(true)
    let retries = 0
    while (retries < 3) {
      try {
        const res = await putSourceCv(data)
        setCurrentVersion(res.version)
        setLastSaved(new Date())
        setIsDirty(false)
        break
      } catch {
        retries++
        if (retries === 3) {
          toast.error('Failed to save. Please try manually.')
        } else {
          await new Promise((r) => setTimeout(r, 5000))
        }
      }
    }
    setIsSaving(false)
  }, [])

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground text-sm">Loading…</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-4xl px-4 py-8">
        <SourceCvHeader
          currentVersion={currentVersion}
          lastSaved={lastSaved}
          isSaving={isSaving}
          versions={versions}
          onVersionCreated={(v) => setVersions((prev) => [v, ...prev])}
          onRestored={async () => {
            const res = await getSourceCv()
            setCv(res.data)
            setCurrentVersion(res.version)
            const vList = await getVersions()
            setVersions(vList)
          }}
        />
        <div className="mt-6">
          <SourceCvEditor
            cv={cv}
            isDirty={isDirty}
            onChange={handleChange}
            onSave={handleSave}
          />
        </div>
      </main>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/app/source-cv/
git commit -m "feat: add Source CV page"
```

---

## Task 14: Nav Link

**Files:**
- Modify: `frontend/components/header.tsx`

- [ ] **Step 1: Add BookOpen to the lucide-react import**

In `frontend/components/header.tsx`, add `BookOpen` to the existing import:

```tsx
import { Moon, Sun, Bookmark, FileText, Briefcase, Rocket, LogOut, User, BookOpen } from 'lucide-react'
```

- [ ] **Step 2: Add Source CV to navItems**

In `frontend/components/header.tsx`, find the `navItems` array and add the Source CV entry:

```tsx
const navItems = [
  { href: '/jobs', label: 'Jobs', icon: Briefcase },
  { href: '/saved', label: 'Saved', icon: Bookmark },
  { href: '/source-cv', label: 'Source CV', icon: BookOpen },
  { href: '/resume', label: 'Resume', icon: FileText },
]
```

- [ ] **Step 3: Run the frontend and verify end-to-end**

```bash
cd frontend && npx pnpm dev
```

1. Open http://localhost:3000
2. Log in with Google
3. Click "Source CV" in the nav
4. Add a section, add a field, add a variation
5. Wait 5 seconds — check console/network for auto-save PUT request
6. Click "Save Version" — version appears in history
7. Make a change, click "History" → "Restore" — data reverts

- [ ] **Step 4: Commit**

```bash
git add frontend/components/header.tsx
git commit -m "feat: add Source CV nav link"
```

---

## Task 15: Final Check + Merge

- [ ] **Step 1: Run all backend tests**

```bash
cd backend && ./gradlew test
```

Expected: All PASS

- [ ] **Step 2: Run frontend build to catch type errors**

```bash
cd frontend && npx pnpm build
```

Expected: BUILD SUCCESSFUL (no TypeScript errors)

- [ ] **Step 3: End-to-end test per merge policy**

Per `CLAUDE.md`: run both BE and FE, verify the feature works end-to-end in the browser before merging.

- [ ] **Step 4: Merge to main (or create PR)**

```bash
git checkout main
git merge --no-ff feature/source-cv-editor
git push
```
