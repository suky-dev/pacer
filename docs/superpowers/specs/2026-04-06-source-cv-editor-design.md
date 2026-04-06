# Source CV Editor — Design Spec
**Date:** 2026-04-06
**Phase:** 1 of 2 (Source CV Editor → Resume Session)
**Status:** Approved

---

## Overview

Source CV는 유저의 모든 경력 정보를 담는 single source of truth. 구조화된 트리 형태로 저장하며, 각 항목은 여러 표현(variation)을 가질 수 있다. Phase 2의 Resume 세션에서 AI가 이 데이터를 참고해 JD 맞춤 이력서 작성을 돕는다.

이 스펙은 **Phase 1: Source CV 에디터**만 다룬다.

---

## Data Model

### DB Schema

```sql
CREATE TABLE source_cvs (
  id          UUID PRIMARY KEY,
  user_id     UUID NOT NULL REFERENCES users(id),
  version     INT NOT NULL DEFAULT 1,
  label       VARCHAR(255),
  data        JSONB NOT NULL DEFAULT '{"sections":[]}',
  created_at  TIMESTAMPTZ NOT NULL,
  updated_at  TIMESTAMPTZ NOT NULL,
  UNIQUE (user_id, version)
);
```

- 유저당 여러 row — 현재 버전 = `ORDER BY version DESC LIMIT 1`
- `label`: 선택적 버전 이름 (예: "Pre-Google interview", "Oct 2025")
- Auto-save는 현재 버전 row의 `data`를 덮어씀 (새 row 생성 X)
- 명시적 "버전 저장" 액션만 새 row를 생성

### JSONB 스키마

```ts
type SourceCv = {
  sections: Section[]
}

type Section = {
  id: string        // client-generated UUID
  title: string     // "EXPERIENCE", "TECHNICAL SKILLS", "EDUCATION" 등 자유 입력
  entries: Entry[]
}

type Entry = {
  id: string
  label?: string    // 선택적 표시 이름 e.g. "Channel Corporation"
  fields: Field[]
}

type Field = {
  id: string
  type: string      // freeform key: "title", "period", "bullet", "company" 등
  value: Variation[]
}

type Variation = {
  id: string
  renderType: RenderType
  value: string
}

type RenderType =
  | "header1" | "header2" | "header3" | "header4"
  | "text"
  | "list"
  | "table"
  | "location"
  | "period"
```

**설계 원칙:**
- `Field.type`은 완전히 freeform — 유저가 직접 정의
- `Variation.renderType`은 제한된 enum — 렌더링 방식 결정
- `Variation.value`는 항상 배열로 일관 처리 (period처럼 하나만 쓰는 경우도 동일 구조)
- Variation 간 renderType이 달라도 됨 (e.g. skills: text 버전 + table 버전)

---

## Backend

### API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/users/me/source-cv` | JWT | 최신 버전 조회. 없으면 빈 CV 반환 (404 X) |
| PUT | `/api/users/me/source-cv` | JWT | 현재 버전 data 덮어쓰기 (auto-save) |
| GET | `/api/users/me/source-cv/versions` | JWT | 버전 목록 조회 |
| POST | `/api/users/me/source-cv/versions` | JWT | 새 버전 체크포인트 생성 (label 선택적) |
| POST | `/api/users/me/source-cv/versions/{id}/restore` | JWT | 해당 버전으로 복원 (새 버전 생성) |

### 도메인 구조

```
domain/sourcecv/
  SourceCv.kt               // JPA entity
  SourceCvRepository.kt
  SourceCvService.kt
  SourceCvController.kt
  dto/
    SourceCvResponse.kt
    SourceCvVersionSummary.kt
    UpdateSourceCvRequest.kt
    CreateVersionRequest.kt   // label?: String
```

### 컨벤션 (기존 도메인과 일관)

- Entity PK: `@UuidGenerator(style = UuidGenerator.Style.TIME)`
- Controller: `@AuthenticationPrincipal jwt: Jwt` + `UUID.fromString(jwt.subject)`
- Service: 변경 메서드에 `@Transactional`
- DTO Response: `data class` + `companion object fun from()` 팩토리
- JSONB 저장: `@Column(columnDefinition = "jsonb") @JdbcTypeCode(SqlTypes.JSON) var data: String`
- Jackson으로 서비스 레이어에서 직렬화/역직렬화

---

## Frontend

### 라우팅

```
/source-cv    — Source CV 에디터 (신규)
```

### 컴포넌트 트리

```
SourceCvPage
├── SourceCvHeader              — 버전 표시, "버전 저장" 버튼, 마지막 저장 시각
└── SourceCvEditor              — 인라인 트리 (스크롤형 단일 페이지)
    └── SectionBlock[]
        ├── SectionHeader       — 섹션 제목 편집, 섹션 추가/삭제/순서변경
        └── EntryBlock[]
            ├── EntryHeader     — label 편집, 엔트리 추가/삭제
            └── FieldRow[]      — type(freeform) + Variation[]
                └── VariationChip[]   — 클릭 → 인라인 textarea 오픈
                                       renderType 선택, 값 편집, 삭제
```

### 상태 관리

```ts
const [cv, setCv] = useState<SourceCv>()
const [isDirty, setIsDirty] = useState(false)
const [lastSaved, setLastSaved] = useState<Date>()
const [versions, setVersions] = useState<VersionSummary[]>()
```

### Auto-save (5초 debounce)

```ts
useEffect(() => {
  if (!isDirty) return
  const timer = setTimeout(() => {
    putSourceCv(cv)
    setIsDirty(false)
    setLastSaved(new Date())
  }, 5000)
  return () => clearTimeout(timer)
}, [cv, isDirty])
```

모든 편집 → `setCv(updated)` + `setIsDirty(true)` → 5초 idle 후 자동 저장.

---

## Error Handling

**Auto-save 실패:**
- 토스트: "저장 실패 — 재시도 중"
- `isDirty` 유지 → 5초 후 재시도 (최대 3회)
- 3회 실패 시 수동 저장 버튼 표시

**첫 방문 (Source CV 없음):**
- `GET` → 빈 `{"sections":[]}` 반환 (서버에서 404 대신 빈 응답)
- 에디터는 빈 상태로 시작, "섹션 추가" 버튼만 표시

---

## Out of Scope (Phase 1)

- 동시 편집 / 충돌 감지 → Phase 2 이후 고려
- 버전 복원 시 미저장 변경사항 처리
- Resume 세션 (AI 어시스턴트, JD 매칭) → Phase 2 별도 스펙
