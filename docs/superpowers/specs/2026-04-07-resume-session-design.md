# Resume Session — Design Spec
**Date:** 2026-04-07
**Phase:** 2 of 2 (Source CV Editor → Resume Session)
**Status:** Approved

---

## Overview

A Resume Session takes a user's Source CV and a target job description, runs a one-shot Claude analysis to surface bullet recommendations, and lets the user accept or reject suggestions to build a tailored resume. On apply, the final content is snapshotted as JSONB and locked. Sessions serve as a read-only archive after that point.

This spec covers **Phase 2: Resume Session** only. Source CV is Phase 1.

---

## Data Model

### DB Schema

```sql
CREATE TABLE resume_sessions (
    id             UUID         PRIMARY KEY,
    user_id        UUID         NOT NULL REFERENCES users(id),
    source_cv_id   UUID         NOT NULL REFERENCES source_cvs(id),

    -- Job description (manual paste for now; job_id FK added when pipeline ships)
    jd_company     VARCHAR(255),
    jd_role        VARCHAR(255),
    jd_text        TEXT         NOT NULL,

    -- User enrichment (separate from raw JD)
    jd_summary     TEXT,          -- AI-generated or user-written JD summary
    ai_advice      TEXT,          -- Claude's overall application advice
    user_notes     TEXT,          -- personal notes

    -- One-shot Claude analysis result
    ai_suggestions JSONB         NOT NULL DEFAULT '{}',

    -- Final resume snapshot (NULL until finalized; locked on apply)
    content        JSONB,

    status         VARCHAR(50)   NOT NULL DEFAULT 'draft', -- draft | applied
    applied_at     TIMESTAMPTZ,
    created_at     TIMESTAMPTZ   NOT NULL,
    updated_at     TIMESTAMPTZ   NOT NULL
);
```

**Notes:**
- `job_id` column will be added via migration when the Job Collection Pipeline ships (item 2 on the roadmap). Until then, JD is stored as plain text.
- `content` reuses the same JSONB schema as `source_cvs.data` — a snapshot of the selected/edited sections and fields.
- `status` transitions: `draft` → `applied`. No re-editing after `applied`.

### `ai_suggestions` JSONB structure

```ts
type AiSuggestions = {
  recommendations: Recommendation[]
  skillsToHighlight: string[]
  generalAdvice: string
}

type Recommendation = {
  sourceNodeId: string       // Field id from Source CV
  variationIndex: number     // Which variation was referenced
  suggested: string          // Refined bullet text
  reason: string             // Why this matches the JD
  accepted: boolean | null   // null = pending, true = accepted, false = rejected
}
```

### `content` JSONB structure

Same schema as `SourceCv` from the Source CV spec:

```ts
type ResumeContent = {
  sections: Section[]        // subset/edited version of Source CV sections
}
```

---

## Backend

### API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/api/users/me/resume-sessions` | JWT | List all sessions (summary only) |
| `POST` | `/api/users/me/resume-sessions` | JWT | Create session (jd fields + source_cv_id) |
| `GET` | `/api/users/me/resume-sessions/:id` | JWT | Full session detail |
| `POST` | `/api/users/me/resume-sessions/:id/analyze` | JWT | Run Claude one-shot analysis; populates `ai_suggestions` |
| `PUT` | `/api/users/me/resume-sessions/:id` | JWT | Update suggestions (accept/reject), notes, content |
| `POST` | `/api/users/me/resume-sessions/:id/apply` | JWT | Lock content + set status=applied + record applied_at |

**Constraints:**
- `PUT` and `POST .../analyze` return `403` if `status = applied`.
- `POST .../apply` requires `content` to be non-null.

### Domain Structure

```
domain/resumesession/
  ResumeSession.kt
  ResumeSessionRepository.kt
  ResumeSessionService.kt
  ResumeSessionController.kt
  dto/
    ResumeSessionSummary.kt       // for list endpoint
    ResumeSessionResponse.kt      // for detail endpoint
    CreateResumeSessionRequest.kt
    UpdateResumeSessionRequest.kt
```

### Claude Integration

- Called from `ResumeSessionService.analyze()`
- Input context: `jd_text` + full Source CV `data` JSONB
- Output: structured JSON matching `AiSuggestions` type (prompt instructs Claude to respond in JSON)
- Synchronous for MVP (no streaming); the FE shows a loading state

### Conventions (consistent with existing domains)

- Entity PK: `@UuidGenerator(style = UuidGenerator.Style.TIME)`
- Controller: `@AuthenticationPrincipal jwt: Jwt` + `UUID.fromString(jwt.subject)`
- Service: `@Transactional` on mutating methods
- DTO Response: `data class` + `companion object fun from()` factory
- JSONB: `@Column(columnDefinition = "jsonb") @JdbcTypeCode(SqlTypes.JSON) var data: String`
- Jackson for serialize/deserialize in service layer

---

## Frontend

### Routes

```
/resumes           — session list
/resumes/new       — 3-step creation flow
/resumes/:id       — session detail (draft: editable | applied: read-only)
```

### `/resumes/new` — 3-step flow

Steps 1 and 2 are frontend-only state (no API call until both are complete).

```
Step 1: Job Description
  - Input: jd_company, jd_role, jd_text (textarea)
  - No API call yet

Step 2: Source CV
  - Select which Source CV version to use
  - Action: POST /resume-sessions → session created with both jd fields + source_cv_id

Step 3: Analysis
  - Trigger: "Analyze" button → POST .../analyze
  - Loading state while Claude runs
  - Result: recommendation cards (accept / reject toggle per bullet)
  - Editable: jd_summary, ai_advice (populated by Claude), user_notes
  - content assembly: frontend builds content JSONB from accepted recommendations
    applied against the source CV data, then PUTs it along with ai_suggestions state
  - Final action: "Mark as Applied" → POST .../apply → redirects to /resumes/:id (read-only)
```

### `/resumes/:id` — Session detail

- `draft`: shows Step 3 UI, all fields editable
- `applied`: read-only view of `content` + metadata panel (company, role, applied_at, notes)
- Print button: triggers `window.print()` for browser-native PDF export

### Component Tree

```
ResumesPage (list)
└── SessionCard[]         — company, role, status badge, applied_at

ResumeNewPage (3-step)
├── StepIndicator
├── Step1JdForm
├── Step2SourceCvPicker
└── Step3Analysis
    ├── AnalyzeButton
    ├── RecommendationCard[]    — suggested bullet, reason, accept/reject
    ├── SkillsToHighlight
    ├── GeneralAdvicePanel      — editable after populated
    ├── UserNotesField
    └── ApplyButton

ResumeDetailPage
├── SessionMetaPanel            — company, role, applied_at, notes (read-only)
└── ResumeContentView           — renders content JSONB (reuses Source CV renderer)
    └── PrintButton
```

---

## Error Handling

**Analyze fails (Claude API error):**
- Toast: "Analysis failed — please try again"
- `ai_suggestions` unchanged; button re-enabled

**Apply blocked (content is null):**
- "Mark as Applied" button disabled until at least one recommendation is accepted and content is set

**Editing an applied session:**
- `PUT` returns `403`; FE shows toast: "This session is locked after applying"

---

## Out of Scope (Phase 2)

- `job_id` FK to `jobs` table — added when Job Collection Pipeline ships
- Re-editing after `status = applied`
- Streaming Claude responses
- Multiple apply attempts / re-application tracking
- Application Tracking via Gmail OAuth (Phase 3)
