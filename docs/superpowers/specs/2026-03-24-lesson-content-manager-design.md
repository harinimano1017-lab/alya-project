# Lesson Content Manager — Design Spec
**Date:** 2026-03-24
**Feature:** `/educator/lessons` — VS Code-style file explorer + lesson panel editor
**Status:** Approved

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
- `LessonMedia.language` — `EN | TA | HI`
- `MediaAsset.mimeType` — `video/youtube` for YouTube links, `image/*` for R2 uploads

---

## 3. Page Architecture

### Server Component
`app/(dashboard)/educator/lessons/page.tsx`
- Protected by existing educator layout (EDUCATOR/ADMIN only)
- Fetches full tree via `GET /api/modules?all=true`
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
- Props: `type: 'module' | 'submodule' | 'lesson'`, node data, depth, isSelected, isExpanded, isRenaming
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
- Fetches `GET /api/lessons/[id]` on lesson selection (by lesson DB id)
- Shows lesson name as editable `<input>` at top
- Language selector (EN / TA / HI) pill tabs
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
  1. `POST /api/media/upload-url` with `{ subModuleSlug, lessonSlug, type: 'concept-image', lang, ext, mimeType }`
  2. `PUT uploadUrl` with file body
  3. `POST /api/media/confirm` with `{ s3Key, mediaType: 'CONCEPT_IMAGE', mimeType, lessonId, language }`
  4. Update local lesson media state
- Shows upload progress

### `TextPanel.tsx` (Panel C)
- Editable `<textarea>` pre-filled from `lesson.wordText` (or translation for non-EN)
- Save button → `PATCH /api/lessons/[id]` with `{ wordText }` (EN) or creates/updates `LessonTranslation` (TA/HI)

---

## 5. State Management

All state lives in `LessonManager` as React `useState`. No Zustand (page-local concerns).

```ts
type TreeModule = Module & {
  subModules: (SubModule & { lessons: Lesson[] })[]
}

// Key state
modules: TreeModule[]
expandedIds: Set<string>       // module + submodule IDs
selectedLesson: { lesson: Lesson; subModule: SubModule; module: TreeModule } | null
renamingId: string | null      // ID of node currently being renamed
contextMenu: { node: TreeNode; x: number; y: number } | null
activeLanguage: 'EN' | 'TA' | 'HI'
lessonDetail: LessonWithMedia | null   // fetched when lesson selected
```

**Optimistic mutations:** Local state updates immediately; API fires in background; on error, revert and show toast.

---

## 6. API Routes

### Existing — modified

| Route | Change |
|---|---|
| `GET /api/modules` | Add `?all=true` param → skip `isPublished` filter (auth-gated to EDUCATOR/ADMIN) |
| `POST /api/modules` | Add POST handler — create module with slug |
| `GET /api/lessons/[id]` | Already exists — no change needed (fetches by slug currently, change to fetch by DB id) |

### New routes

| Route | Handler |
|---|---|
| `POST /api/sub-modules` | Create sub-module: `{ title, moduleId }` → auto-slug, return created record |
| `PATCH /api/sub-modules/[id]` | Rename: `{ title }` → update title (and slug) |
| `DELETE /api/sub-modules/[id]` | Delete — guard: reject if sub-module has lessons |
| `POST /api/lessons` | Create lesson: `{ wordText, subModuleId }` → auto-slug |
| `PATCH /api/lessons/[id]` | Update: `{ wordText }` |
| `DELETE /api/lessons/[id]` | Delete lesson and all associated LessonMedia + MediaAsset records |

### Slug generation (server-side)
```ts
function toSlug(text: string): string {
  return text.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
}
// Uniqueness: append -2, -3 etc. if slug already exists
```

---

## 7. UI Styling

- **Left sidebar**: white bg, `border-r border-[var(--alya-purple-light)]`, 280px fixed width
- **Tree indent**: 12px per level, chevron icons for expand/collapse
- **Selected lesson**: `bg-[var(--alya-purple-light)] text-[var(--alya-purple)]`
- **Folder icon**: purple (`text-[var(--alya-purple)]`)
- **File icon**: lighter purple (`text-[var(--alya-purple-mid)]`)
- **Context menu**: `rounded-xl shadow-lg border border-[var(--alya-purple-light)] bg-white`
- **Panel cards**: white, `rounded-2xl border border-[var(--alya-purple-light)] shadow-sm p-5`
- **Language pills**: same style as existing role pills

---

## 8. Protected Access

The existing `app/(dashboard)/educator/layout.tsx` already enforces EDUCATOR role. ADMIN access requires no additional layout — they access educator routes directly (already handled by auth).

For ADMIN role to access `/educator/lessons`, a minor adjustment: the educator layout currently redirects non-EDUCATOR roles. We need to allow ADMIN through as well.

---

## 9. Error Handling

- **Delete with children**: SubModule delete API returns 409; UI shows inline error "Remove all lessons first"
- **Duplicate slug**: API returns 409; UI shows "A lesson with that name already exists"
- **Upload failure**: Show inline error per panel with retry button
- **Network errors on tree mutations**: Revert optimistic update, show toast

---

## 10. Out of Scope (MVP)

- Drag-and-drop reordering
- Publish/unpublish toggle in the explorer
- Multi-select for bulk delete
- Lesson duplication
- Full multi-language translation UI (language selector present, but TA/HI text save is deferred)
