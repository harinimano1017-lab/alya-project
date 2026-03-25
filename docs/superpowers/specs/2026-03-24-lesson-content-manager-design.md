# Lesson Content Manager — Design Spec
**Date:** 2026-03-24
**Feature:** `/educator/lessons` — VS Code-style file explorer + lesson panel editor
**Status:** Approved (v2 — post spec-review)

---

## 1. Overview

A full-page split-panel interface at `/educator/lessons` for EDUCATOR and ADMIN roles. Left panel: a VS Code-style tree explorer showing the full Module → SubModule → Lesson hierarchy. Right panel: a lesson media editor with 4 panels (lip reading video, concept image, text, sign language video).

---

## 2. Data Model

The existing Prisma schema maps directly:

```
Module         → top-level collapsible section (e.g. "Animals")
  SubModule    → expandable folder (e.g. "Domestic Animals")
    Lesson     → file (e.g. "Cat")
      LessonMedia → per-panel, per-language media asset
        MediaAsset → either YouTube embed URL or R2 CDN URL
```

**Key fields:**
- `Module.slug`, `SubModule.slug`, `Lesson.slug` — used for S3 key construction and routing
- `LessonMedia.panelType` — `LIP_READING_VIDEO | CONCEPT_IMAGE | SIGN_LANGUAGE_VIDEO`
- `LessonMedia.language` — `EN | TA`
- `MediaAsset.mimeType` — `video/youtube` for YouTube links, `image/*` for R2 uploads

---

## 3. Page Architecture

### Prerequisite: Fix educator layout ADMIN access
**This must be done first.** `app/(dashboard)/educator/layout.tsx` currently redirects any role other than EDUCATOR. ADMIN users must also be allowed through:

```ts
// Before: if (session.user.role !== 'EDUCATOR') redirect('/')
// After:
if (session.user.role !== 'EDUCATOR' && session.user.role !== 'ADMIN') redirect('/')
```

### Server Component
`app/(dashboard)/educator/lessons/page.tsx`
- Protected by educator layout (EDUCATOR/ADMIN only, per fix above)
- Calls `GET /api/modules?all=true` server-side (using `auth()` session — bypasses HTTP)
- Passes initial tree data as props to `LessonManager`

### Root Client Component
`components/lesson-manager/LessonManager.tsx`
- Owns all page state: tree data, expanded nodes, selected lesson, context menu, rename mode, active language
- Renders the split-panel layout: `FileExplorer` (left, fixed 280px) + `LessonEditor` (right, flex-1)

---

## 4. Component Breakdown

### `FileExplorer.tsx`
- Renders the three-level tree
- "New Module" button at the top (creates Module → enters inline rename)
- Toolbar with "New Module" and collapse-all buttons
- Passes callbacks down: `onSelect`, `onRename`, `onDelete`, `onCreateChild`, `onContextMenu`

### `TreeNode.tsx`
- Recursive — renders a Module, SubModule, or Lesson row
- Props: `type: 'module' | 'submodule' | 'lesson'`, `nodeData: TreeNodeData`, depth, isSelected, isExpanded, isRenaming
- Expand/collapse toggle (chevron icon) for modules and submodules
- Double-click name → enters inline rename mode (replaces text with focused `<input>`)
- Right-click → fires `onContextMenu` with node reference and mouse position
- "Add subfolder" icon appears on module hover; "Add file" icon appears on submodule hover

### `ContextMenu.tsx`
- Absolutely positioned `div` at `{ top: mouseY, left: mouseX }`
- Closed on outside click or `Escape` keydown
- Options by node type:
  - Module: "New Sub-module", "Rename", "Delete"
  - SubModule: "New Lesson", "Rename", "Delete" (blocked if has lessons)
  - Lesson: "Rename", "Delete"

### `LessonEditor.tsx`
- Shown when a lesson is selected; empty state otherwise
- On lesson selection: fetches `GET /api/lessons/${lesson.slug}` — uses the lesson's **slug** (already in tree data), so the existing route (`where: { slug: id }`) requires no change
- Shows lesson name as editable `<input>` at top
- Language selector (EN / TA) pill tabs
- Renders four `<PanelCard>` sections: A, B, C, D
- Each panel card has a title, status indicator (filled/empty), and the panel component

### `YouTubePanel.tsx` (Panels A and D)
- If media exists for selected language: shows `<iframe>` YouTube embed preview
- Always shows URL input + "Save" button below the preview (to replace)
- On save: `POST /api/media/youtube` with `{ url, panelType, lessonId, language }`
- Shows saving/error state

### `ImagePanel.tsx` (Panel B)
- If media exists: shows `<img>` with CDN URL
- File picker button → on file select:
  1. `POST /api/media/upload-url` with `{ subModuleSlug, lessonSlug, type: 'concept-image', lang, ext, mimeType }` — these values come from the selected lesson's context in `LessonManager` state (the `TreeModule` type carries `module.slug` and `subModule.slug`)
  2. `PUT uploadUrl` directly to R2 with the file as body
  3. `POST /api/media/confirm` with `{ s3Key, mediaType: 'CONCEPT_IMAGE', mimeType, lessonId, language, widthPx?, heightPx? }`
  4. Update local `lessonDetail` state with the new media asset
- Shows upload progress bar

### `TextPanel.tsx` (Panel C)
- Editable `<textarea>` pre-filled from `lesson.wordText`
- Save button → `PATCH /api/lessons/[id]` with `{ wordText }`
- **MVP scope**: EN only. When a non-EN language is active, this panel shows a "Translation editing coming soon" placeholder and the save button is disabled. No `LessonTranslation` writes in this version.

---

## 5. State Management

All state lives in `LessonManager` as React `useState`. No Zustand (page-local concerns).

```ts
// Shared data types (types.ts)
type TreeNodeData =
  | { type: 'module';    data: TreeModule }
  | { type: 'submodule'; data: TreeSubModule; parent: TreeModule }
  | { type: 'lesson';    data: Lesson; parent: TreeSubModule; grandparent: TreeModule }

type TreeModule = Module & {
  subModules: TreeSubModule[]
}
type TreeSubModule = SubModule & { lessons: Lesson[] }

// LessonManager state
modules: TreeModule[]
expandedIds: Set<string>           // module + submodule IDs
selectedLesson: {
  lesson: Lesson
  subModule: TreeSubModule
  module: TreeModule
} | null
renamingId: string | null          // ID of node currently being renamed
contextMenu: { node: TreeNodeData; x: number; y: number } | null
activeLanguage: 'EN' | 'TA'
lessonDetail: LessonWithMedia | null   // fetched when lesson selected
```

**Optimistic mutations:** Local state updates immediately; API fires in background; on error, revert and show toast.

**`orderIndex` on create:** When creating any new record, the API assigns `(MAX existing orderIndex) + 1` within the parent scope. Implementation uses `findFirst({ orderBy: { orderIndex: 'desc' } })` and takes `.orderIndex + 1`, defaulting to `0` if no records exist yet. Scope per type: Module → global (all modules); SubModule → within `moduleId`; Lesson → within `subModuleId`.

---

## 6. API Routes

### Authentication requirement
**All API routes** (new and modified) must call `const session = await auth()` and return 401 if no session, 403 if the role is not EDUCATOR or ADMIN. This applies without exception.

### Existing — modified

| Route | Required change |
|---|---|
| `GET /api/modules` | Add `?all=true` param → skip `isPublished` filter. Gate: only EDUCATOR/ADMIN may use `all=true`. |
| `POST /api/modules` | Add POST handler to existing route file — create module with auto-slug and `orderIndex = MAX(Module.orderIndex across all modules) + 1` (global scope). |
| `GET /api/lessons/[id]` | **No change needed.** Route stays as `where: { slug: id }`. `LessonEditor` passes `lesson.slug` (available in tree state), not the DB uuid. |

### New routes

| Route | Body / Behaviour |
|---|---|
| `POST /api/sub-modules` | `{ title, moduleId }` → auto-slug, `orderIndex = MAX + 1` within module, return created record |
| `PATCH /api/sub-modules/[id]` | `{ title }` → update title and re-generate slug |
| `DELETE /api/sub-modules/[id]` | Guard: return 409 if sub-module has any lessons. Otherwise delete. |
| `POST /api/lessons` | `{ wordText, subModuleId }` → auto-slug, `orderIndex = MAX + 1` within sub-module |
| `PATCH /api/lessons/[id]` | `{ wordText }` → update lesson; also update slug if wordText changed |
| `DELETE /api/lessons/[id]` | Delete `LessonMedia` join rows first, then delete `MediaAsset` records **only if no other `LessonMedia` rows reference them**, then delete `Lesson`. |

### Slug generation (server-side)
```ts
function toSlug(text: string): string {
  return text.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
}
// Uniqueness: attempt insert; on unique constraint violation, append -2, -3, etc.
```

### API response envelope
All routes return `{ success: true, data: <record> }` on success, consistent with existing module/lesson routes.

---

## 7. UI Styling

- **Left sidebar**: white bg, `border-r border-[var(--alya-purple-light)]`, 280px fixed width
- **Tree indent**: 12px per level, chevron icons for expand/collapse
- **Selected lesson**: `bg-[var(--alya-purple-light)] text-[var(--alya-purple)]`
- **Folder icon**: purple (`text-[var(--alya-purple)]`)
- **File icon**: lighter purple (`text-[var(--alya-purple-mid)]`)
- **Context menu**: `rounded-xl shadow-lg border border-[var(--alya-purple-light)] bg-white`
- **Panel cards**: white, `rounded-2xl border border-[var(--alya-purple-light)] shadow-sm p-5`
- **Language pills**: same style as existing role badge pills

---

## 8. Protected Access

**Prerequisite (see Section 3):** Fix educator layout to allow ADMIN through.

All API routes independently verify session and role (see Section 6). Layout-level redirect is a navigation convenience only, not a security boundary.

---

## 9. Error Handling

- **Delete submodule with lessons**: API returns 409; UI shows inline error "Remove all lessons first"
- **Delete lesson**: cascades safely — only orphaned `MediaAsset` records are deleted (Section 6)
- **Duplicate slug**: API returns 409; UI shows "A lesson with that name already exists"
- **Upload failure**: Show inline error per panel with retry button
- **Network errors on tree mutations**: Revert optimistic update, show toast notification

---

## 10. Out of Scope (MVP)

- Drag-and-drop reordering (orderIndex write via drag)
- Publish/unpublish toggle in the explorer
- Multi-select for bulk delete
- Lesson duplication
- TA/HI text translation editing (`TextPanel` shows placeholder for non-EN languages)
