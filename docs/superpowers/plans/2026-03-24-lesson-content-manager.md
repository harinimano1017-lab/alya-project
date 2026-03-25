# Lesson Content Manager Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a full-page VS Code-style lesson content manager at `/educator/lessons` for EDUCATOR and ADMIN roles, with a three-level file tree (Module → SubModule → Lesson) and a four-panel media editor.

**Architecture:** Server component page fetches initial tree data, passes it to a `LessonManager` root client component that owns all state. Left panel is a `FileExplorer` with `TreeNode` components and a `ContextMenu`. Right panel is a `LessonEditor` with four panel components (YouTubePanel, ImagePanel, TextPanel, YouTubePanel). All mutations are optimistic with API calls in background.

**Tech Stack:** Next.js 16 App Router, React 19 `useState`, Prisma/PostgreSQL, Tailwind CSS v4 with Alya CSS variables, `next-auth` v5 (`auth()`), Cloudflare R2 (existing `/api/media/*` routes), Lucide React icons.

---

## File Map

**Prerequisites / Utilities**
- Modify: `app/(dashboard)/educator/layout.tsx` — allow ADMIN through
- Create: `lib/utils/slug.ts` — `toSlug()` helper

**API Routes**
- Modify: `app/api/modules/route.ts` — add `?all=true` GET + POST create
- Modify: `app/api/modules/[id]/route.ts` — add PATCH rename
- Create: `app/api/sub-modules/route.ts` — POST create
- Create: `app/api/sub-modules/[id]/route.ts` — PATCH rename, DELETE
- Modify: `app/api/lessons/route.ts` — add POST create
- Modify: `app/api/lessons/[id]/route.ts` — add PATCH update, DELETE

**Components**
- Create: `components/lesson-manager/types.ts` — shared TS types
- Create: `components/lesson-manager/ContextMenu.tsx` — right-click menu
- Create: `components/lesson-manager/TreeNode.tsx` — recursive tree row
- Create: `components/lesson-manager/FileExplorer.tsx` — left panel tree
- Create: `components/lesson-manager/panels/YouTubePanel.tsx` — panels A & D
- Create: `components/lesson-manager/panels/ImagePanel.tsx` — panel B
- Create: `components/lesson-manager/panels/TextPanel.tsx` — panel C
- Create: `components/lesson-manager/LessonEditor.tsx` — right panel
- Create: `components/lesson-manager/LessonManager.tsx` — root client component

**Page**
- Modify: `app/(dashboard)/educator/lessons/page.tsx` — replace stub with server component

---

## Task 1: Prerequisites — Educator Layout Fix + Slug Utility

**Files:**
- Modify: `app/(dashboard)/educator/layout.tsx`
- Create: `lib/utils/slug.ts`

- [ ] **Step 1: Fix educator layout to allow ADMIN**

Edit `app/(dashboard)/educator/layout.tsx`, change line 9:

```tsx
// Before:
if (session.user.role !== 'EDUCATOR') redirect('/')

// After:
if (session.user.role !== 'EDUCATOR' && session.user.role !== 'ADMIN') redirect('/')
```

- [ ] **Step 2: Create slug utility**

Create `lib/utils/slug.ts`:

```ts
/**
 * Converts a display title to a URL-safe slug.
 * e.g. "Domestic Animals" → "domestic-animals"
 */
export function toSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
}
```

- [ ] **Step 3: Commit**

```bash
git add app/(dashboard)/educator/layout.tsx lib/utils/slug.ts
git commit -m "feat: allow ADMIN through educator layout; add toSlug utility"
```

---

## Task 2: Update Modules API (GET all=true + POST create + PATCH rename)

**Files:**
- Modify: `app/api/modules/route.ts`
- Modify: `app/api/modules/[id]/route.ts`

- [ ] **Step 1: Update `app/api/modules/route.ts`**

Replace the entire file:

```ts
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { toSlug } from '@/lib/utils/slug'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const all = searchParams.get('all') === 'true'

  // ?all=true is EDUCATOR/ADMIN only
  if (all) {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (session.user.role !== 'EDUCATOR' && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
  }

  try {
    const modules = await prisma.module.findMany({
      where: all ? undefined : { isPublished: true },
      orderBy: { orderIndex: 'asc' },
      include: {
        subModules: {
          where: all ? undefined : { isPublished: true },
          orderBy: { orderIndex: 'asc' },
          include: {
            lessons: {
              where: all ? undefined : { isPublished: true },
              orderBy: { orderIndex: 'asc' },
              ...(all ? {} : { include: { media: { include: { mediaAsset: true } } } }),
            },
          },
        },
      },
    })

    return NextResponse.json({ success: true, data: modules })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (session.user.role !== 'EDUCATOR' && session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const { title } = await req.json()
    if (!title?.trim()) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 })
    }

    const last = await prisma.module.findFirst({ orderBy: { orderIndex: 'desc' } })
    const orderIndex = (last?.orderIndex ?? -1) + 1
    const baseSlug = toSlug(title.trim())

    // Ensure unique slug
    let slug = baseSlug
    let suffix = 2
    while (await prisma.module.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${suffix++}`
    }

    const module = await prisma.module.create({
      data: { title: title.trim(), slug, orderIndex, isPublished: false },
    })

    return NextResponse.json({ success: true, data: module })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
```

- [ ] **Step 2: Add DELETE handler for modules + PATCH rename to `app/api/modules/[id]/route.ts`**

Modules can be deleted only if they have no sub-modules (same guard pattern as sub-module delete):

```ts
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { toSlug } from '@/lib/utils/slug'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const module = await prisma.module.findUnique({
      where: { id },
      include: { subModules: { orderBy: { orderIndex: 'asc' } } },
    })
    if (!module) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json({ success: true, data: module })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (session.user.role !== 'EDUCATOR' && session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { id } = await params
  try {
    const { title } = await req.json()
    if (!title?.trim()) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 })
    }

    const baseSlug = toSlug(title.trim())
    let slug = baseSlug
    let suffix = 2
    while (true) {
      const existing = await prisma.module.findUnique({ where: { slug } })
      if (!existing || existing.id === id) break
      slug = `${baseSlug}-${suffix++}`
    }

    const module = await prisma.module.update({
      where: { id },
      data: { title: title.trim(), slug },
    })
    return NextResponse.json({ success: true, data: module })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (session.user.role !== 'EDUCATOR' && session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { id } = await params
  try {
    const subModuleCount = await prisma.subModule.count({ where: { moduleId: id } })
    if (subModuleCount > 0) {
      return NextResponse.json({ error: 'Remove all sub-modules first' }, { status: 409 })
    }
    await prisma.module.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
```

- [ ] **Step 3: Commit**

```bash
git add app/api/modules/route.ts app/api/modules/[id]/route.ts
git commit -m "feat: modules API — all=true param, POST create, PATCH rename"
```

---

## Task 3: Sub-Modules API (POST + PATCH + DELETE)

**Files:**
- Create: `app/api/sub-modules/route.ts`
- Create: `app/api/sub-modules/[id]/route.ts`

- [ ] **Step 1: Create `app/api/sub-modules/route.ts`**

```ts
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { toSlug } from '@/lib/utils/slug'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (session.user.role !== 'EDUCATOR' && session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const { title, moduleId } = await req.json()
    if (!title?.trim() || !moduleId) {
      return NextResponse.json({ error: 'title and moduleId are required' }, { status: 400 })
    }

    const last = await prisma.subModule.findFirst({
      where: { moduleId },
      orderBy: { orderIndex: 'desc' },
    })
    const orderIndex = (last?.orderIndex ?? -1) + 1

    const baseSlug = toSlug(title.trim())
    let slug = baseSlug
    let suffix = 2
    while (await prisma.subModule.findFirst({ where: { slug, moduleId } })) {
      slug = `${baseSlug}-${suffix++}`
    }

    const subModule = await prisma.subModule.create({
      data: { title: title.trim(), slug, moduleId, orderIndex, isPublished: false },
    })

    return NextResponse.json({ success: true, data: subModule })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
```

- [ ] **Step 2: Create `app/api/sub-modules/[id]/route.ts`**

```ts
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { toSlug } from '@/lib/utils/slug'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (session.user.role !== 'EDUCATOR' && session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { id } = await params
  try {
    const { title } = await req.json()
    if (!title?.trim()) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 })
    }

    const existing = await prisma.subModule.findUnique({ where: { id } })
    if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const baseSlug = toSlug(title.trim())
    let slug = baseSlug
    let suffix = 2
    while (true) {
      const found = await prisma.subModule.findFirst({
        where: { slug, moduleId: existing.moduleId },
      })
      if (!found || found.id === id) break
      slug = `${baseSlug}-${suffix++}`
    }

    const subModule = await prisma.subModule.update({
      where: { id },
      data: { title: title.trim(), slug },
    })
    return NextResponse.json({ success: true, data: subModule })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (session.user.role !== 'EDUCATOR' && session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { id } = await params
  try {
    const lessonCount = await prisma.lesson.count({ where: { subModuleId: id } })
    if (lessonCount > 0) {
      return NextResponse.json(
        { error: 'Remove all lessons first' },
        { status: 409 }
      )
    }

    await prisma.subModule.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
```

- [ ] **Step 3: Commit**

```bash
git add app/api/sub-modules/
git commit -m "feat: sub-modules API — POST create, PATCH rename, DELETE (guarded)"
```

---

## Task 4: Update Lessons API (POST + PATCH + DELETE)

**Files:**
- Modify: `app/api/lessons/route.ts`
- Modify: `app/api/lessons/[id]/route.ts`

- [ ] **Step 1: Update `app/api/lessons/route.ts`** — add POST handler

```ts
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { toSlug } from '@/lib/utils/slug'

export async function GET() {
  const lessons = await prisma.lesson.findMany({
    where: { isPublished: true },
    orderBy: { orderIndex: 'asc' },
    include: {
      subModule: {
        include: { module: { select: { title: true, slug: true } } },
      },
    },
  })
  return NextResponse.json({ lessons })
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (session.user.role !== 'EDUCATOR' && session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const { wordText, subModuleId } = await req.json()
    if (!wordText?.trim() || !subModuleId) {
      return NextResponse.json({ error: 'wordText and subModuleId are required' }, { status: 400 })
    }

    const last = await prisma.lesson.findFirst({
      where: { subModuleId },
      orderBy: { orderIndex: 'desc' },
    })
    const orderIndex = (last?.orderIndex ?? -1) + 1

    const baseSlug = toSlug(wordText.trim())
    let slug = baseSlug
    let suffix = 2
    while (await prisma.lesson.findFirst({ where: { slug, subModuleId } })) {
      slug = `${baseSlug}-${suffix++}`
    }

    const lesson = await prisma.lesson.create({
      data: { wordText: wordText.trim(), slug, subModuleId, orderIndex, isPublished: false },
    })

    return NextResponse.json({ success: true, data: lesson })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
```

- [ ] **Step 2: Update `app/api/lessons/[id]/route.ts`** — add PATCH and DELETE

**Important:** The `[id]` segment serves a dual purpose:
- `GET` — receives `lesson.slug` (called by `LessonEditor` which passes `selected.lesson.slug` from tree state)
- `PATCH` and `DELETE` — receive the DB UUID (called by `TextPanel` and `LessonManager` which pass `lesson.id`)

This is intentional per the spec. The implementations below use `where: { slug: id }` for GET and `where: { id }` for PATCH/DELETE. Client code must never pass a slug to PATCH/DELETE.

```ts
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { toSlug } from '@/lib/utils/slug'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const lesson = await prisma.lesson.findUnique({
      where: { slug: id },
      include: {
        media: { include: { mediaAsset: true } },
        translations: true,
        subModule: { include: { module: true } },
      },
    })

    if (!lesson) return NextResponse.json({ error: 'Lesson not found' }, { status: 404 })
    return NextResponse.json({ success: true, data: lesson })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (session.user.role !== 'EDUCATOR' && session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { id } = await params
  try {
    const { wordText } = await req.json()
    if (!wordText?.trim()) {
      return NextResponse.json({ error: 'wordText is required' }, { status: 400 })
    }

    const existing = await prisma.lesson.findUnique({ where: { id } })
    if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const baseSlug = toSlug(wordText.trim())
    let slug = baseSlug
    let suffix = 2
    while (true) {
      const found = await prisma.lesson.findFirst({
        where: { slug, subModuleId: existing.subModuleId },
      })
      if (!found || found.id === id) break
      slug = `${baseSlug}-${suffix++}`
    }

    const lesson = await prisma.lesson.update({
      where: { id },
      data: { wordText: wordText.trim(), slug },
    })
    return NextResponse.json({ success: true, data: lesson })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (session.user.role !== 'EDUCATOR' && session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { id } = await params
  try {
    // Get LessonMedia rows to find MediaAsset ids
    const lessonMediaRows = await prisma.lessonMedia.findMany({ where: { lessonId: id } })
    const mediaAssetIds = lessonMediaRows.map((lm) => lm.mediaAssetId)

    // Delete LessonMedia join rows
    await prisma.lessonMedia.deleteMany({ where: { lessonId: id } })

    // Delete MediaAssets only if no other LessonMedia rows reference them
    for (const assetId of mediaAssetIds) {
      const refCount = await prisma.lessonMedia.count({ where: { mediaAssetId: assetId } })
      if (refCount === 0) {
        await prisma.mediaAsset.delete({ where: { id: assetId } })
      }
    }

    await prisma.lesson.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
```

- [ ] **Step 3: Commit**

```bash
git add app/api/lessons/route.ts app/api/lessons/[id]/route.ts
git commit -m "feat: lessons API — POST create, PATCH update+reslug, DELETE safe cascade"
```

---

## Task 5: Shared Types

**Files:**
- Create: `components/lesson-manager/types.ts`

- [ ] **Step 1: Create types file**

```ts
import { LanguageCode } from '@/types/curriculum'

// Raw Prisma shapes (minimal — only what the tree needs)
export type TreeLesson = {
  id: string
  slug: string
  wordText: string
  orderIndex: number
  isPublished: boolean
  subModuleId: string
}

export type TreeSubModule = {
  id: string
  slug: string
  title: string
  orderIndex: number
  isPublished: boolean
  moduleId: string
  lessons: TreeLesson[]
}

export type TreeModule = {
  id: string
  slug: string
  title: string
  orderIndex: number
  isPublished: boolean
  subModules: TreeSubModule[]
}

// Discriminated union for context menu / selection
export type TreeNodeData =
  | { type: 'module'; data: TreeModule }
  | { type: 'submodule'; data: TreeSubModule; parent: TreeModule }
  | { type: 'lesson'; data: TreeLesson; parent: TreeSubModule; grandparent: TreeModule }

// Full lesson detail fetched from GET /api/lessons/[slug]
export type MediaAssetDetail = {
  id: string
  s3Key: string
  cdnUrl: string
  mediaType: string
  mimeType: string
  language: LanguageCode
}

export type LessonMediaDetail = {
  id: string
  panelType: string
  language: LanguageCode
  mediaAsset: MediaAssetDetail
}

export type LessonDetail = {
  id: string
  slug: string
  wordText: string
  isPublished: boolean
  subModuleId: string
  media: LessonMediaDetail[]
  subModule: {
    id: string
    slug: string
    title: string
    module: {
      id: string
      slug: string
      title: string
    }
  }
}

// Context menu state
export type ContextMenuState = {
  node: TreeNodeData
  x: number
  y: number
}

// Selected lesson context (includes parent refs for S3 key construction)
export type SelectedLesson = {
  lesson: TreeLesson
  subModule: TreeSubModule
  module: TreeModule
}
```

- [ ] **Step 2: Commit**

```bash
git add components/lesson-manager/types.ts
git commit -m "feat: lesson-manager shared TypeScript types"
```

---

## Task 6: ContextMenu Component

**Files:**
- Create: `components/lesson-manager/ContextMenu.tsx`

- [ ] **Step 1: Create `ContextMenu.tsx`**

```tsx
'use client'

import { useEffect, useRef } from 'react'
import { TreeNodeData } from './types'

type Props = {
  node: TreeNodeData
  x: number
  y: number
  onClose: () => void
  onRename: (node: TreeNodeData) => void
  onDelete: (node: TreeNodeData) => void
  onCreateChild: (node: TreeNodeData) => void
}

export function ContextMenu({ node, x, y, onClose, onRename, onDelete, onCreateChild }: Props) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose()
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('mousedown', handleClick)
    document.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('mousedown', handleClick)
      document.removeEventListener('keydown', handleKey)
    }
  }, [onClose])

  const menuItems: { label: string; action: () => void; danger?: boolean }[] = []

  if (node.type === 'module') {
    menuItems.push({ label: 'New Sub-module', action: () => { onCreateChild(node); onClose() } })
    menuItems.push({ label: 'Rename', action: () => { onRename(node); onClose() } })
    menuItems.push({ label: 'Delete', action: () => { onDelete(node); onClose() }, danger: true })
  } else if (node.type === 'submodule') {
    menuItems.push({ label: 'New Lesson', action: () => { onCreateChild(node); onClose() } })
    menuItems.push({ label: 'Rename', action: () => { onRename(node); onClose() } })
    menuItems.push({ label: 'Delete', action: () => { onDelete(node); onClose() }, danger: true })
  } else {
    menuItems.push({ label: 'Rename', action: () => { onRename(node); onClose() } })
    menuItems.push({ label: 'Delete', action: () => { onDelete(node); onClose() }, danger: true })
  }

  return (
    <div
      ref={ref}
      style={{ top: y, left: x }}
      className="fixed z-50 min-w-[160px] rounded-xl border border-[var(--alya-purple-light)] bg-white py-1 shadow-lg"
    >
      {menuItems.map((item) => (
        <button
          key={item.label}
          onClick={item.action}
          className={`w-full px-4 py-2 text-left text-sm transition-colors hover:bg-[var(--alya-purple-pale)] ${
            item.danger ? 'text-red-500 hover:text-red-600' : 'text-gray-700'
          }`}
        >
          {item.label}
        </button>
      ))}
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add components/lesson-manager/ContextMenu.tsx
git commit -m "feat: ContextMenu component for tree nodes"
```

---

## Task 7: TreeNode Component

**Files:**
- Create: `components/lesson-manager/TreeNode.tsx`

- [ ] **Step 1: Create `TreeNode.tsx`** — preliminary draft; Task 8 Step 2 replaces the entire file

```tsx
'use client'

import { useRef, useState } from 'react'
import { ChevronRight, ChevronDown, Folder, FileText, FolderPlus, FilePlus } from 'lucide-react'
import { TreeNodeData, TreeModule, TreeSubModule, TreeLesson } from './types'

type Props = {
  node: TreeNodeData
  isSelected: boolean
  isExpanded: boolean
  isRenaming: boolean
  onSelect: (node: TreeNodeData) => void
  onToggle: (id: string) => void
  onContextMenu: (node: TreeNodeData, x: number, y: number) => void
  onRenameSubmit: (node: TreeNodeData, newTitle: string) => void
  onRenameCancel: () => void
  onCreateChild: (node: TreeNodeData) => void
}

export function TreeNode({
  node,
  isSelected,
  isExpanded,
  isRenaming,
  onSelect,
  onToggle,
  onContextMenu,
  onRenameSubmit,
  onRenameCancel,
  onCreateChild,
}: Props) {
  const [hovered, setHovered] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const id = node.type === 'module' ? node.data.id
    : node.type === 'submodule' ? node.data.id
    : node.data.id

  const label = node.type === 'lesson' ? node.data.wordText : (node.data as TreeModule | TreeSubModule).title
  const depth = node.type === 'module' ? 0 : node.type === 'submodule' ? 1 : 2
  const hasChildren = node.type !== 'lesson'
  const isLeaf = node.type === 'lesson'

  function handleContextMenu(e: React.MouseEvent) {
    e.preventDefault()
    onContextMenu(node, e.clientX, e.clientY)
  }

  function handleDoubleClick(e: React.MouseEvent) {
    e.preventDefault()
    // Trigger rename inline — parent sets renamingId
    onContextMenu(node, 0, 0) // sentinel: parent interprets (0,0) as rename shortcut
    // Actually: trigger rename directly via a separate prop approach
    // We'll use the input render when isRenaming=true
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      const val = e.currentTarget.value.trim()
      if (val) onRenameSubmit(node, val)
    } else if (e.key === 'Escape') {
      onRenameCancel()
    }
  }

  return (
    <div>
      <div
        className={`group flex cursor-pointer items-center gap-1 rounded-lg px-2 py-1.5 text-sm transition-colors ${
          isSelected
            ? 'bg-[var(--alya-purple-light)] text-[var(--alya-purple)]'
            : 'text-gray-700 hover:bg-gray-50'
        }`}
        style={{ paddingLeft: `${8 + depth * 16}px` }}
        onClick={() => {
          if (hasChildren) onToggle(id)
          onSelect(node)
        }}
        onContextMenu={handleContextMenu}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onDoubleClick={(e) => {
          e.preventDefault()
          // Signal parent to enter rename mode for this node
          onRenameSubmit(node, label) // will be intercepted as "start rename" when isRenaming is false
        }}
      >
        {/* Expand chevron */}
        {hasChildren ? (
          <span className="flex-shrink-0 text-gray-400">
            {isExpanded ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
          </span>
        ) : (
          <span className="w-3.5 flex-shrink-0" />
        )}

        {/* Icon */}
        {isLeaf ? (
          <FileText className="h-4 w-4 flex-shrink-0 text-[var(--alya-purple-mid,#9B72CF)]" />
        ) : (
          <Folder className="h-4 w-4 flex-shrink-0 text-[var(--alya-purple)]" />
        )}

        {/* Label or rename input */}
        {isRenaming ? (
          <input
            ref={inputRef}
            autoFocus
            defaultValue={label}
            onKeyDown={handleKeyDown}
            onBlur={onRenameCancel}
            onClick={(e) => e.stopPropagation()}
            className="flex-1 rounded border border-[var(--alya-purple)] bg-white px-1 text-sm outline-none"
          />
        ) : (
          <span className="flex-1 truncate">{label}</span>
        )}

        {/* Hover action icons */}
        {!isRenaming && hovered && (
          <span
            className="flex-shrink-0 text-gray-400 hover:text-[var(--alya-purple)]"
            onClick={(e) => { e.stopPropagation(); onCreateChild(node) }}
            title={node.type === 'module' ? 'Add sub-module' : node.type === 'submodule' ? 'Add lesson' : undefined}
          >
            {node.type === 'module' && <FolderPlus className="h-3.5 w-3.5" />}
            {node.type === 'submodule' && <FilePlus className="h-3.5 w-3.5" />}
          </span>
        )}
      </div>

      {/* Children */}
      {hasChildren && isExpanded && (
        <div>
          {node.type === 'module' && node.data.subModules.map((sm) => (
            <TreeNode
              key={sm.id}
              node={{ type: 'submodule', data: sm, parent: node.data }}
              isSelected={isSelected && false}
              isExpanded={false}
              isRenaming={false}
              onSelect={onSelect}
              onToggle={onToggle}
              onContextMenu={onContextMenu}
              onRenameSubmit={onRenameSubmit}
              onRenameCancel={onRenameCancel}
              onCreateChild={onCreateChild}
            />
          ))}
          {node.type === 'submodule' && node.data.lessons.map((l) => (
            <TreeNode
              key={l.id}
              node={{ type: 'lesson', data: l, parent: node.data, grandparent: node.parent }}
              isSelected={isSelected && false}
              isExpanded={false}
              isRenaming={false}
              onSelect={onSelect}
              onToggle={onToggle}
              onContextMenu={onContextMenu}
              onRenameSubmit={onRenameSubmit}
              onRenameCancel={onRenameCancel}
              onCreateChild={onCreateChild}
            />
          ))}
        </div>
      )}
    </div>
  )
}
```

**Note:** `isSelected`, `isExpanded`, `isRenaming` need to be passed correctly from `FileExplorer` using the node ID. The recursive children render passes `false` for those — `FileExplorer` will handle this correctly by iterating modules at top level and passing the computed values.

- [ ] **Step 2: Commit**

```bash
git add components/lesson-manager/TreeNode.tsx
git commit -m "feat: TreeNode recursive component with rename, context menu, hover actions"
```

---

## Task 8: FileExplorer Component

**Files:**
- Create: `components/lesson-manager/FileExplorer.tsx`

- [ ] **Step 1: Create `FileExplorer.tsx`**

```tsx
'use client'

import { Plus, ChevronsUpDown } from 'lucide-react'
import { TreeModule, TreeSubModule, TreeLesson, TreeNodeData } from './types'
import { TreeNode } from './TreeNode'

type Props = {
  modules: TreeModule[]
  expandedIds: Set<string>
  selectedId: string | null
  renamingId: string | null
  onSelect: (node: TreeNodeData) => void
  onToggle: (id: string) => void
  onContextMenu: (node: TreeNodeData, x: number, y: number) => void
  onRenameSubmit: (node: TreeNodeData, newTitle: string) => void
  onRenameCancel: () => void
  onCreateChild: (node: TreeNodeData) => void
  onNewModule: () => void
  onCollapseAll: () => void
}

export function FileExplorer({
  modules,
  expandedIds,
  selectedId,
  renamingId,
  onSelect,
  onToggle,
  onContextMenu,
  onRenameSubmit,
  onRenameCancel,
  onCreateChild,
  onNewModule,
  onCollapseAll,
}: Props) {
  function getSelectedId(node: TreeNodeData): string {
    return node.data.id
  }

  return (
    <aside className="flex w-[280px] flex-shrink-0 flex-col border-r border-[var(--alya-purple-light)] bg-white">
      {/* Toolbar */}
      <div className="flex items-center justify-between border-b border-[var(--alya-purple-light)] px-3 py-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
          Content
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={onNewModule}
            className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-[var(--alya-purple-pale)] hover:text-[var(--alya-purple)]"
            title="New Module"
          >
            <Plus className="h-4 w-4" />
          </button>
          <button
            onClick={onCollapseAll}
            className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-[var(--alya-purple-pale)] hover:text-[var(--alya-purple)]"
            title="Collapse All"
          >
            <ChevronsUpDown className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Tree */}
      <div className="flex-1 overflow-y-auto p-2">
        {modules.length === 0 ? (
          <p className="px-2 py-4 text-center text-xs text-gray-400">
            No modules yet. Click + to create one.
          </p>
        ) : (
          modules.map((mod) => (
            <TreeNode
              key={mod.id}
              node={{ type: 'module', data: mod }}
              isSelected={selectedId === mod.id}
              isExpanded={expandedIds.has(mod.id)}
              isRenaming={renamingId === mod.id}
              onSelect={onSelect}
              onToggle={onToggle}
              onContextMenu={onContextMenu}
              onRenameSubmit={onRenameSubmit}
              onRenameCancel={onRenameCancel}
              onCreateChild={onCreateChild}
            />
          ))
        )}
      </div>
    </aside>
  )
}
```

**Note:** `TreeNode` children are rendered recursively. To pass correct `isSelected`/`isExpanded`/`isRenaming` to sub-nodes, `LessonManager` will pass the full `selectedId` (the lesson's id) and `renamingId` down through the entire tree via `FileExplorer` → `TreeNode` props. Update `TreeNode`'s recursive children render to pass these from parent props (see Task 11 for the wiring fix — `LessonManager` owns the IDs, and `FileExplorer` threads them through).

- [ ] **Step 2: Replace `TreeNode.tsx` entirely and replace `FileExplorer.tsx` entirely**

The Task 7 drafts used boolean props. Both files are replaced here with ID-based props for correct recursive threading.

**Full `TreeNode.tsx` — replace the entire file with this (supersedes the Task 7 draft):**

```tsx
'use client'

import { useRef } from 'react'
import { ChevronRight, ChevronDown, Folder, FileText, FolderPlus, FilePlus } from 'lucide-react'
import { TreeNodeData, TreeModule, TreeSubModule } from './types'

type Props = {
  node: TreeNodeData
  selectedId: string | null
  expandedIds: Set<string>
  renamingId: string | null
  onSelect: (node: TreeNodeData) => void
  onToggle: (id: string) => void
  onContextMenu: (node: TreeNodeData, x: number, y: number) => void
  onStartRename: (node: TreeNodeData) => void
  onRenameSubmit: (node: TreeNodeData, newTitle: string) => void
  onRenameCancel: () => void
  onCreateChild: (node: TreeNodeData) => void
}

export function TreeNode({
  node,
  selectedId,
  expandedIds,
  renamingId,
  onSelect,
  onToggle,
  onContextMenu,
  onStartRename,
  onRenameSubmit,
  onRenameCancel,
  onCreateChild,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null)

  const id = node.data.id
  const label = node.type === 'lesson' ? node.data.wordText : (node.data as TreeModule | TreeSubModule).title
  const depth = node.type === 'module' ? 0 : node.type === 'submodule' ? 1 : 2
  const isSelected = selectedId === id
  const isExpanded = expandedIds.has(id)
  const isRenaming = renamingId === id

  function handleContextMenu(e: React.MouseEvent) {
    e.preventDefault()
    onContextMenu(node, e.clientX, e.clientY)
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      const val = e.currentTarget.value.trim()
      if (val) onRenameSubmit(node, val)
    } else if (e.key === 'Escape') {
      onRenameCancel()
    }
  }

  const sharedChildProps = { selectedId, expandedIds, renamingId, onSelect, onToggle, onContextMenu, onStartRename, onRenameSubmit, onRenameCancel, onCreateChild }

  return (
    <div>
      <div
        className={`group flex cursor-pointer items-center gap-1 rounded-lg py-1.5 pr-2 text-sm transition-colors ${
          isSelected
            ? 'bg-[var(--alya-purple-light)] text-[var(--alya-purple)]'
            : 'text-gray-700 hover:bg-gray-50'
        }`}
        style={{ paddingLeft: `${8 + depth * 16}px` }}
        onClick={() => {
          if (node.type !== 'lesson') onToggle(id)
          onSelect(node)
        }}
        onContextMenu={handleContextMenu}
        onDoubleClick={(e) => { e.preventDefault(); onStartRename(node) }}
      >
        {node.type !== 'lesson' ? (
          <span className="flex-shrink-0 text-gray-400">
            {isExpanded ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
          </span>
        ) : (
          <span className="w-3.5 flex-shrink-0" />
        )}

        {node.type === 'lesson' ? (
          <FileText className="h-4 w-4 flex-shrink-0 text-[var(--alya-purple-mid,#9B72CF)]" />
        ) : (
          <Folder className="h-4 w-4 flex-shrink-0 text-[var(--alya-purple)]" />
        )}

        {isRenaming ? (
          <input
            ref={inputRef}
            autoFocus
            defaultValue={label}
            onKeyDown={handleKeyDown}
            onBlur={onRenameCancel}
            onClick={(e) => e.stopPropagation()}
            className="flex-1 rounded border border-[var(--alya-purple)] bg-white px-1 text-sm outline-none"
          />
        ) : (
          <span className="flex-1 truncate">{label}</span>
        )}

        {!isRenaming && (
          <span
            className="hidden flex-shrink-0 text-gray-400 hover:text-[var(--alya-purple)] group-hover:flex"
            onClick={(e) => { e.stopPropagation(); onCreateChild(node) }}
          >
            {node.type === 'module' && <FolderPlus className="h-3.5 w-3.5" />}
            {node.type === 'submodule' && <FilePlus className="h-3.5 w-3.5" />}
          </span>
        )}
      </div>

      {node.type !== 'lesson' && isExpanded && (
        <div>
          {node.type === 'module' && node.data.subModules.map((sm) => (
            <TreeNode key={sm.id} node={{ type: 'submodule', data: sm, parent: node.data }} {...sharedChildProps} />
          ))}
          {node.type === 'submodule' && node.data.lessons.map((l) => (
            <TreeNode key={l.id} node={{ type: 'lesson', data: l, parent: node.data, grandparent: node.parent }} {...sharedChildProps} />
          ))}
        </div>
      )}
    </div>
  )
}
```

**Full `FileExplorer.tsx` — replace the entire file with this (supersedes the Task 8 Step 1 draft):**

```tsx
'use client'

import { Plus, ChevronsUpDown } from 'lucide-react'
import { TreeModule, TreeNodeData } from './types'
import { TreeNode } from './TreeNode'

type Props = {
  modules: TreeModule[]
  expandedIds: Set<string>
  selectedId: string | null
  renamingId: string | null
  onSelect: (node: TreeNodeData) => void
  onToggle: (id: string) => void
  onContextMenu: (node: TreeNodeData, x: number, y: number) => void
  onStartRename: (node: TreeNodeData) => void
  onRenameSubmit: (node: TreeNodeData, newTitle: string) => void
  onRenameCancel: () => void
  onCreateChild: (node: TreeNodeData) => void
  onNewModule: () => void
  onCollapseAll: () => void
}

export function FileExplorer({
  modules,
  expandedIds,
  selectedId,
  renamingId,
  onSelect,
  onToggle,
  onContextMenu,
  onStartRename,
  onRenameSubmit,
  onRenameCancel,
  onCreateChild,
  onNewModule,
  onCollapseAll,
}: Props) {
  return (
    <aside className="flex w-[280px] flex-shrink-0 flex-col border-r border-[var(--alya-purple-light)] bg-white">
      {/* Toolbar */}
      <div className="flex items-center justify-between border-b border-[var(--alya-purple-light)] px-3 py-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
          Content
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={onNewModule}
            className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-[var(--alya-purple-pale)] hover:text-[var(--alya-purple)]"
            title="New Module"
          >
            <Plus className="h-4 w-4" />
          </button>
          <button
            onClick={onCollapseAll}
            className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-[var(--alya-purple-pale)] hover:text-[var(--alya-purple)]"
            title="Collapse All"
          >
            <ChevronsUpDown className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Tree */}
      <div className="flex-1 overflow-y-auto p-2">
        {modules.length === 0 ? (
          <p className="px-2 py-4 text-center text-xs text-gray-400">
            No modules yet. Click + to create one.
          </p>
        ) : (
          modules.map((mod) => (
            <TreeNode
              key={mod.id}
              node={{ type: 'module', data: mod }}
              selectedId={selectedId}
              expandedIds={expandedIds}
              renamingId={renamingId}
              onSelect={onSelect}
              onToggle={onToggle}
              onContextMenu={onContextMenu}
              onStartRename={onStartRename}
              onRenameSubmit={onRenameSubmit}
              onRenameCancel={onRenameCancel}
              onCreateChild={onCreateChild}
            />
          ))
        )}
      </div>
    </aside>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add components/lesson-manager/FileExplorer.tsx components/lesson-manager/TreeNode.tsx
git commit -m "feat: FileExplorer + TreeNode with correct ID-based selection/expand/rename threading"
```

---

## Task 9: Panel Components (YouTube, Image, Text)

**Files:**
- Create: `components/lesson-manager/panels/YouTubePanel.tsx`
- Create: `components/lesson-manager/panels/ImagePanel.tsx`
- Create: `components/lesson-manager/panels/TextPanel.tsx`

- [ ] **Step 1: Create `YouTubePanel.tsx`**

```tsx
'use client'

import { useState } from 'react'
import { LessonMediaDetail } from '../types'

type Props = {
  panelType: 'LIP_READING_VIDEO' | 'SIGN_LANGUAGE_VIDEO'
  media: LessonMediaDetail | undefined
  lessonId: string          // DB UUID
  language: 'EN' | 'TA'
  onSaved: (media: LessonMediaDetail) => void
}

function extractYouTubeId(url: string): string | null {
  const patterns = [
    /youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/,
    /youtu\.be\/([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
  ]
  for (const p of patterns) {
    const m = url.match(p)
    if (m) return m[1]
  }
  return null
}

export function YouTubePanel({ panelType, media, lessonId, language, onSaved }: Props) {
  const [url, setUrl] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const existingVideoId = media?.mediaAsset.s3Key ?? null
  const embedUrl = existingVideoId ? `https://www.youtube.com/embed/${existingVideoId}` : null

  async function handleSave() {
    const videoId = extractYouTubeId(url.trim())
    if (!videoId) {
      setError('Invalid YouTube URL')
      return
    }
    setSaving(true)
    setError(null)
    try {
      const res = await fetch('/api/media/youtube', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim(), panelType, lessonId, language }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? 'Save failed')
      // Route returns { success: true, data: MediaAsset }
      // Construct a synthetic LessonMediaDetail to update parent state
      onSaved({
        id: json.data.id,
        panelType,
        language,
        mediaAsset: json.data,
      })
      setUrl('')
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-3">
      {embedUrl && (
        <div className="aspect-video w-full overflow-hidden rounded-xl bg-black">
          <iframe
            src={embedUrl}
            className="h-full w-full"
            allowFullScreen
            title="YouTube preview"
          />
        </div>
      )}
      <div className="flex gap-2">
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://www.youtube.com/watch?v=..."
          className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[var(--alya-purple)]"
        />
        <button
          onClick={handleSave}
          disabled={saving || !url.trim()}
          className="rounded-lg bg-[var(--alya-purple)] px-4 py-2 text-sm font-medium text-white transition-opacity disabled:opacity-50"
        >
          {saving ? 'Saving…' : 'Save'}
        </button>
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}
```

- [ ] **Step 2: Create `ImagePanel.tsx`**

```tsx
'use client'

import { useRef, useState } from 'react'
import { Upload } from 'lucide-react'
import { LessonMediaDetail } from '../types'

type Props = {
  media: LessonMediaDetail | undefined
  lessonId: string       // DB UUID
  language: 'EN' | 'TA'
  subModuleSlug: string
  lessonSlug: string
  onSaved: (media: LessonMediaDetail) => void
}

export function ImagePanel({ media, lessonId, language, subModuleSlug, lessonSlug, onSaved }: Props) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const cdnUrl = media?.mediaAsset.cdnUrl ?? null

  async function handleFile(file: File) {
    const ext = file.name.split('.').pop() ?? 'jpg'
    setUploading(true)
    setProgress(10)
    setError(null)

    try {
      // 1. Get presigned URL
      const urlRes = await fetch('/api/media/upload-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subModuleSlug,
          lessonSlug,
          type: 'concept-image',
          lang: language.toLowerCase(),
          ext,
          mimeType: file.type,
        }),
      })
      const { uploadUrl, s3Key } = await urlRes.json()
      setProgress(30)

      // 2. PUT directly to R2
      await fetch(uploadUrl, {
        method: 'PUT',
        headers: { 'Content-Type': file.type },
        body: file,
      })
      setProgress(80)

      // 3. Confirm
      const confirmRes = await fetch('/api/media/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          s3Key,
          mediaType: 'CONCEPT_IMAGE',
          mimeType: file.type,
          lessonId,
          language,
        }),
      })
      const confirmJson = await confirmRes.json()
      if (!confirmRes.ok) throw new Error(confirmJson.error ?? 'Confirm failed')
      setProgress(100)
      // /api/media/confirm returns { success: true, asset: MediaAsset }
      // Construct a synthetic LessonMediaDetail to update parent state
      const syntheticMedia: LessonMediaDetail = {
        id: confirmJson.asset.id,
        panelType: 'CONCEPT_IMAGE',
        language,
        mediaAsset: confirmJson.asset,
      }
      onSaved(syntheticMedia)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Upload failed')
    } finally {
      setUploading(false)
      setProgress(0)
    }
  }

  return (
    <div className="space-y-3">
      {cdnUrl && (
        <img
          src={cdnUrl}
          alt="Concept image"
          className="max-h-48 w-full rounded-xl object-contain"
        />
      )}

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => { if (e.target.files?.[0]) handleFile(e.target.files[0]) }}
      />

      <button
        onClick={() => fileRef.current?.click()}
        disabled={uploading}
        className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-[var(--alya-purple-light)] py-3 text-sm text-[var(--alya-purple)] transition-colors hover:bg-[var(--alya-purple-pale)] disabled:opacity-50"
      >
        <Upload className="h-4 w-4" />
        {uploading ? `Uploading… ${progress}%` : cdnUrl ? 'Replace Image' : 'Upload Image'}
      </button>

      {uploading && (
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
          <div
            className="h-full bg-[var(--alya-purple)] transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {error && (
        <p className="text-xs text-red-500">
          {error}{' '}
          <button onClick={() => setError(null)} className="underline">Retry</button>
        </p>
      )}
    </div>
  )
}
```

- [ ] **Step 3: Create `TextPanel.tsx`**

```tsx
'use client'

import { useState } from 'react'

type Props = {
  wordText: string
  lessonId: string    // DB UUID (used for PATCH)
  language: 'EN' | 'TA'
  onSaved: (newWordText: string) => void
}

export function TextPanel({ wordText, lessonId, language, onSaved }: Props) {
  // Hooks MUST come before any early returns (React Rules of Hooks)
  const [value, setValue] = useState(wordText)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isEN = language === 'EN'

  async function handleSave() {
    setSaving(true)
    setError(null)
    try {
      const res = await fetch(`/api/lessons/${lessonId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wordText: value.trim() }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? 'Save failed')
      onSaved(json.data.wordText)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  if (!isEN) {
    return (
      <p className="py-4 text-center text-sm text-gray-400">
        Translation editing coming soon.
      </p>
    )
  }

  return (
    <div className="space-y-3">
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        rows={3}
        className="w-full resize-none rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[var(--alya-purple)]"
        placeholder="Enter word text…"
      />
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-400">EN only in this version</span>
        <button
          onClick={handleSave}
          disabled={saving || !value.trim()}
          className="rounded-lg bg-[var(--alya-purple)] px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {saving ? 'Saving…' : 'Save'}
        </button>
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}
```

- [ ] **Step 4: Commit**

```bash
git add components/lesson-manager/panels/
git commit -m "feat: YouTubePanel, ImagePanel, TextPanel components"
```

---

## Task 10: LessonEditor Component

**Files:**
- Create: `components/lesson-manager/LessonEditor.tsx`

- [ ] **Step 1: Create `LessonEditor.tsx`**

```tsx
'use client'

import { useEffect, useState } from 'react'
import { BookOpen } from 'lucide-react'
import { SelectedLesson, LessonDetail, LessonMediaDetail } from './types'
import { YouTubePanel } from './panels/YouTubePanel'
import { ImagePanel } from './panels/ImagePanel'
import { TextPanel } from './panels/TextPanel'

type Props = {
  selected: SelectedLesson | null
  activeLanguage: 'EN' | 'TA'
  onLanguageChange: (lang: 'EN' | 'TA') => void
}

const PANELS = [
  { key: 'A', panelType: 'LIP_READING_VIDEO' as const, label: 'Lip Reading Video' },
  { key: 'B', panelType: 'CONCEPT_IMAGE' as const, label: 'Concept Image' },
  { key: 'C', panelType: 'TEXT' as const, label: 'Word Text' },
  { key: 'D', panelType: 'SIGN_LANGUAGE_VIDEO' as const, label: 'Sign Language Video' },
]

export function LessonEditor({ selected, activeLanguage, onLanguageChange }: Props) {
  const [detail, setDetail] = useState<LessonDetail | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!selected) { setDetail(null); return }
    setLoading(true)
    setError(null)
    fetch(`/api/lessons/${selected.lesson.slug}`)
      .then((r) => r.json())
      .then((json) => { if (json.success) setDetail(json.data); else setError('Failed to load lesson') })
      .catch(() => setError('Network error'))
      .finally(() => setLoading(false))
  }, [selected?.lesson.slug])  // use slug — matches what the fetch actually uses

  if (!selected) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center text-gray-400">
        <BookOpen className="mb-3 h-10 w-10 opacity-30" />
        <p className="text-sm">Select a lesson to edit its content</p>
      </div>
    )
  }

  if (loading) {
    return <div className="flex flex-1 items-center justify-center text-sm text-gray-400">Loading…</div>
  }

  if (error) {
    return <div className="flex flex-1 items-center justify-center text-sm text-red-500">{error}</div>
  }

  function getMedia(panelType: string): LessonMediaDetail | undefined {
    return detail?.media.find((m) => m.panelType === panelType && m.language === activeLanguage)
  }

  function handleMediaSaved(panelType: string, newMedia: LessonMediaDetail) {
    if (!detail) return
    setDetail({
      ...detail,
      media: [
        ...detail.media.filter((m) => !(m.panelType === panelType && m.language === activeLanguage)),
        newMedia,
      ],
    })
  }

  function handleTextSaved(newWordText: string) {
    if (!detail) return
    setDetail({ ...detail, wordText: newWordText })
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* Header */}
      <div className="border-b border-[var(--alya-purple-light)] px-8 py-4">
        <div className="flex items-center justify-between">
          <h2
            className="text-lg font-semibold"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--alya-purple-dark)' }}
          >
            {detail?.wordText ?? selected.lesson.wordText}
          </h2>

          {/* Language tabs */}
          <div className="flex gap-1 rounded-lg bg-gray-100 p-1">
            {(['EN', 'TA'] as const).map((lang) => (
              <button
                key={lang}
                onClick={() => onLanguageChange(lang)}
                className={`rounded-md px-3 py-1 text-xs font-semibold transition-all ${
                  activeLanguage === lang
                    ? 'bg-white text-[var(--alya-purple)] shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {lang}
              </button>
            ))}
          </div>
        </div>
        <p className="mt-0.5 text-xs text-gray-400">
          {selected.module.title} / {selected.subModule.title}
        </p>
      </div>

      {/* Panels grid */}
      <div className="flex-1 overflow-y-auto p-8">
        <div className="grid grid-cols-2 gap-5">
          {PANELS.map(({ key, panelType, label }) => {
            const isFilled = !!getMedia(panelType) || (panelType === 'TEXT' && !!detail?.wordText)
            return (
              <div
                key={key}
                className="rounded-2xl border border-[var(--alya-purple-light)] bg-white p-5 shadow-sm"
              >
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-md bg-[var(--alya-purple-light)] text-xs font-bold text-[var(--alya-purple)]">
                      {key}
                    </span>
                    <span className="text-sm font-semibold text-gray-700">{label}</span>
                  </div>
                  <span
                    className={`h-2 w-2 rounded-full ${isFilled ? 'bg-emerald-400' : 'bg-gray-200'}`}
                    title={isFilled ? 'Has content' : 'Empty'}
                  />
                </div>

                {panelType === 'LIP_READING_VIDEO' && (
                  <YouTubePanel
                    panelType="LIP_READING_VIDEO"
                    media={getMedia('LIP_READING_VIDEO')}
                    lessonId={selected.lesson.id}
                    language={activeLanguage}
                    onSaved={(m) => handleMediaSaved('LIP_READING_VIDEO', m)}
                  />
                )}
                {panelType === 'CONCEPT_IMAGE' && (
                  <ImagePanel
                    media={getMedia('CONCEPT_IMAGE')}
                    lessonId={selected.lesson.id}
                    language={activeLanguage}
                    subModuleSlug={selected.subModule.slug}
                    lessonSlug={selected.lesson.slug}
                    onSaved={(m) => handleMediaSaved('CONCEPT_IMAGE', m)}
                  />
                )}
                {panelType === 'TEXT' && (
                  <TextPanel
                    wordText={detail?.wordText ?? ''}
                    lessonId={selected.lesson.id}
                    language={activeLanguage}
                    onSaved={handleTextSaved}
                  />
                )}
                {panelType === 'SIGN_LANGUAGE_VIDEO' && (
                  <YouTubePanel
                    panelType="SIGN_LANGUAGE_VIDEO"
                    media={getMedia('SIGN_LANGUAGE_VIDEO')}
                    lessonId={selected.lesson.id}
                    language={activeLanguage}
                    onSaved={(m) => handleMediaSaved('SIGN_LANGUAGE_VIDEO', m)}
                  />
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add components/lesson-manager/LessonEditor.tsx
git commit -m "feat: LessonEditor with 4-panel media editor and language tabs"
```

---

## Task 11: LessonManager Root Client Component

**Files:**
- Create: `components/lesson-manager/LessonManager.tsx`

This is the largest component — owns all state and wires the tree mutations.

- [ ] **Step 1: Create `LessonManager.tsx`**

```tsx
'use client'

import { useState } from 'react'
import { TreeModule, TreeSubModule, TreeLesson, TreeNodeData, SelectedLesson, ContextMenuState } from './types'
import { FileExplorer } from './FileExplorer'
import { LessonEditor } from './LessonEditor'
import { ContextMenu } from './ContextMenu'

type Props = {
  initialModules: TreeModule[]
}

export function LessonManager({ initialModules }: Props) {
  const [modules, setModules] = useState<TreeModule[]>(initialModules)
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())
  const [selectedLesson, setSelectedLesson] = useState<SelectedLesson | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [renamingId, setRenamingId] = useState<string | null>(null)
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null)
  const [activeLanguage, setActiveLanguage] = useState<'EN' | 'TA'>('EN')

  // ── Tree selection ──────────────────────────────────────────────────────────
  function handleSelect(node: TreeNodeData) {
    setSelectedId(node.data.id)
    if (node.type === 'lesson') {
      setSelectedLesson({ lesson: node.data, subModule: node.parent, module: node.grandparent })
    } else {
      setSelectedLesson(null)
    }
    setContextMenu(null)
  }

  function handleToggle(id: string) {
    setExpandedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id); else next.add(id)
      return next
    })
  }

  function handleCollapseAll() {
    setExpandedIds(new Set())
  }

  // ── Context menu ────────────────────────────────────────────────────────────
  function handleContextMenu(node: TreeNodeData, x: number, y: number) {
    setContextMenu({ node, x, y })
  }

  // ── Rename ──────────────────────────────────────────────────────────────────
  function handleStartRename(node: TreeNodeData) {
    setRenamingId(node.data.id)
    setContextMenu(null)
  }

  async function handleRenameSubmit(node: TreeNodeData, newTitle: string) {
    const originalTitle = node.type === 'lesson' ? node.data.wordText : (node.data as TreeModule | TreeSubModule).title
    if (newTitle === originalTitle) { setRenamingId(null); return }

    // Optimistic update
    setModules((prev) => applyRename(prev, node.data.id, node.type, newTitle))
    setRenamingId(null)

    try {
      let url: string
      let body: Record<string, string>
      if (node.type === 'module') {
        url = `/api/modules/${node.data.id}`
        body = { title: newTitle }
      } else if (node.type === 'submodule') {
        url = `/api/sub-modules/${node.data.id}`
        body = { title: newTitle }
      } else {
        url = `/api/lessons/${node.data.id}`
        body = { wordText: newTitle }
      }
      const res = await fetch(url, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      if (!res.ok) throw new Error('Rename failed')
      const json = await res.json()
      // Update slug from server response
      setModules((prev) => applySlugUpdate(prev, node.data.id, node.type, json.data.slug))
    } catch {
      // Revert
      setModules((prev) => applyRename(prev, node.data.id, node.type, originalTitle))
      alert('Rename failed. Please try again.')
    }
  }

  function handleRenameCancel() {
    setRenamingId(null)
  }

  // ── Delete ──────────────────────────────────────────────────────────────────
  async function handleDelete(node: TreeNodeData) {
    const label = node.type === 'lesson' ? node.data.wordText : (node.data as TreeModule | TreeSubModule).title
    if (!confirm(`Delete "${label}"? This cannot be undone.`)) return

    // Optimistic remove
    setModules((prev) => applyDelete(prev, node.data.id, node.type))
    if (selectedLesson?.lesson.id === node.data.id) setSelectedLesson(null)

    try {
      let url: string
      if (node.type === 'module') url = `/api/modules/${node.data.id}`
      else if (node.type === 'submodule') url = `/api/sub-modules/${node.data.id}`
      else url = `/api/lessons/${node.data.id}`

      const res = await fetch(url, { method: 'DELETE' })
      if (!res.ok) {
        const json = await res.json()
        throw new Error(json.error ?? 'Delete failed')
      }
    } catch (e: unknown) {
      // Revert — refetch to get consistent state
      const freshRes = await fetch('/api/modules?all=true')
      const freshJson = await freshRes.json()
      if (freshJson.success) setModules(freshJson.data)
      alert(e instanceof Error ? e.message : 'Delete failed')
    }
  }

  // ── Create child ────────────────────────────────────────────────────────────
  async function handleCreateChild(node: TreeNodeData) {
    if (node.type === 'lesson') return // no children

    const defaultTitle = node.type === 'module' ? 'New Sub-module' : 'New Lesson'

    if (node.type === 'module') {
      // Create sub-module
      const res = await fetch('/api/sub-modules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: defaultTitle, moduleId: node.data.id }),
      })
      const json = await res.json()
      if (!json.success) { alert('Failed to create sub-module'); return }
      const newSM: TreeSubModule = { ...json.data, lessons: [] }
      setModules((prev) => prev.map((m) =>
        m.id === node.data.id
          ? { ...m, subModules: [...m.subModules, newSM] }
          : m
      ))
      // Expand parent and start renaming
      setExpandedIds((prev) => new Set([...prev, node.data.id]))
      setRenamingId(newSM.id)
    } else if (node.type === 'submodule') {
      // Create lesson
      const res = await fetch('/api/lessons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wordText: defaultTitle, subModuleId: node.data.id }),
      })
      const json = await res.json()
      if (!json.success) { alert('Failed to create lesson'); return }
      const newLesson: TreeLesson = json.data
      setModules((prev) => prev.map((m) => ({
        ...m,
        subModules: m.subModules.map((sm) =>
          sm.id === node.data.id
            ? { ...sm, lessons: [...sm.lessons, newLesson] }
            : sm
        ),
      })))
      // Expand parent sub-module and start renaming
      setExpandedIds((prev) => new Set([...prev, node.data.id]))
      setRenamingId(newLesson.id)
    }
  }

  // ── Create new module ───────────────────────────────────────────────────────
  async function handleNewModule() {
    const res = await fetch('/api/modules', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'New Module' }),
    })
    const json = await res.json()
    if (!json.success) { alert('Failed to create module'); return }
    const newModule: TreeModule = { ...json.data, subModules: [] }
    setModules((prev) => [...prev, newModule])
    setRenamingId(newModule.id)
  }

  return (
    <div className="flex h-full overflow-hidden rounded-2xl border border-[var(--alya-purple-light)] bg-white shadow-sm">
      <FileExplorer
        modules={modules}
        expandedIds={expandedIds}
        selectedId={selectedId}
        renamingId={renamingId}
        onSelect={handleSelect}
        onToggle={handleToggle}
        onContextMenu={handleContextMenu}
        onStartRename={handleStartRename}
        onRenameSubmit={handleRenameSubmit}
        onRenameCancel={handleRenameCancel}
        onCreateChild={handleCreateChild}
        onNewModule={handleNewModule}
        onCollapseAll={handleCollapseAll}
      />

      <LessonEditor
        selected={selectedLesson}
        activeLanguage={activeLanguage}
        onLanguageChange={setActiveLanguage}
      />

      {contextMenu && (
        <ContextMenu
          node={contextMenu.node}
          x={contextMenu.x}
          y={contextMenu.y}
          onClose={() => setContextMenu(null)}
          onRename={handleStartRename}
          onDelete={handleDelete}
          onCreateChild={handleCreateChild}
        />
      )}
    </div>
  )
}

// ── Pure state helpers ──────────────────────────────────────────────────────

function applyRename(modules: TreeModule[], id: string, type: string, newTitle: string): TreeModule[] {
  return modules.map((m) => {
    if (type === 'module' && m.id === id) return { ...m, title: newTitle }
    return {
      ...m,
      subModules: m.subModules.map((sm) => {
        if (type === 'submodule' && sm.id === id) return { ...sm, title: newTitle }
        return {
          ...sm,
          lessons: sm.lessons.map((l) =>
            type === 'lesson' && l.id === id ? { ...l, wordText: newTitle } : l
          ),
        }
      }),
    }
  })
}

function applySlugUpdate(modules: TreeModule[], id: string, type: string, newSlug: string): TreeModule[] {
  return modules.map((m) => {
    if (type === 'module' && m.id === id) return { ...m, slug: newSlug }
    return {
      ...m,
      subModules: m.subModules.map((sm) => {
        if (type === 'submodule' && sm.id === id) return { ...sm, slug: newSlug }
        return {
          ...sm,
          lessons: sm.lessons.map((l) =>
            type === 'lesson' && l.id === id ? { ...l, slug: newSlug } : l
          ),
        }
      }),
    }
  })
}

function applyDelete(modules: TreeModule[], id: string, type: string): TreeModule[] {
  if (type === 'module') return modules.filter((m) => m.id !== id)
  return modules.map((m) => ({
    ...m,
    subModules: type === 'submodule'
      ? m.subModules.filter((sm) => sm.id !== id)
      : m.subModules.map((sm) => ({
          ...sm,
          lessons: sm.lessons.filter((l) => l.id !== id),
        })),
  }))
}
```

- [ ] **Step 2: Commit**

```bash
git add components/lesson-manager/LessonManager.tsx
git commit -m "feat: LessonManager root component with optimistic mutations"
```

---

## Task 12: Page Integration + Smoke Test

**Files:**
- Modify: `app/(dashboard)/educator/lessons/page.tsx`

- [ ] **Step 1: Replace the lessons page**

```tsx
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { LessonManager } from '@/components/lesson-manager/LessonManager'
import { TreeModule } from '@/components/lesson-manager/types'

export const metadata = { title: 'Lesson Manager — Alya' }

export default async function EducatorLessonsPage() {
  const session = await auth()
  if (!session?.user) redirect('/login')

  // Query Prisma directly — server component, no HTTP round-trip needed (per spec "bypasses HTTP")
  const { prisma } = await import('@/lib/prisma')
  const rawModules = await prisma.module.findMany({
    orderBy: { orderIndex: 'asc' },
    include: {
      subModules: {
        orderBy: { orderIndex: 'asc' },
        include: {
          lessons: { orderBy: { orderIndex: 'asc' } },
        },
      },
    },
  })

  const modules = rawModules as unknown as TreeModule[]

  return (
    <div className="flex h-[calc(100vh-64px)] flex-col gap-0 p-0">
      <LessonManager initialModules={modules} />
    </div>
  )
}
```

**Note:** The page calls Prisma directly (as the spec says "bypasses HTTP") instead of going through the API route. This is cleaner for a server component. The layout already guards EDUCATOR/ADMIN access.

- [ ] **Step 2: Run build to verify no TypeScript errors**

```bash
npm run build
```

Expected: Build succeeds with no type errors. Fix any issues before proceeding.

- [ ] **Step 3: Start dev server and smoke test**

```bash
npm run dev
```

Manual checks:
1. Log in as EDUCATOR → navigate to `/educator/lessons` → see the split-panel layout
2. Log in as ADMIN → navigate to `/educator/lessons` → also see the layout (not redirected)
3. Click the `+` button → "New Module" row appears with rename input
4. Type a module name → press Enter → module appears in tree
5. Hover a module → FolderPlus icon appears → click → "New Sub-module" appears
6. Hover a sub-module → FilePlus icon → click → "New Lesson" appears
7. Click a lesson → right panel shows LessonEditor with 4 panel cards
8. Paste a YouTube URL in panel A → click Save → iframe preview appears
9. Right-click a node → ContextMenu appears with correct options
10. Press Escape → ContextMenu closes

- [ ] **Step 4: Commit**

```bash
git add app/(dashboard)/educator/lessons/page.tsx
git commit -m "feat: educator lessons page — full LessonManager integration"
```

---

## Task 13: Add YouTube API Route (if missing)

Check that `app/api/media/youtube/route.ts` exists. If not:

**Files:**
- Create: `app/api/media/youtube/route.ts`

- [ ] **Step 1: Check for the route**

```bash
ls app/api/media/youtube/
```

If it returns "No such file", create it:

- [ ] **Step 2: Create the YouTube route**

Note: `server/media/youtubeService.ts` already exists in the repo. The route extracts `videoId` from the URL before calling `saveYouTubeVideo` (the service takes `videoId`, not `url`):

```ts
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { saveYouTubeVideo, extractYouTubeId } from '@/server/media/youtubeService'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (session.user.role !== 'EDUCATOR' && session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const { url, panelType, lessonId, language } = await req.json()
    if (!url || !panelType || !lessonId || !language) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }

    const videoId = extractYouTubeId(url)
    if (!videoId) {
      return NextResponse.json({ error: 'Invalid YouTube URL' }, { status: 400 })
    }

    // saveYouTubeVideo returns the MediaAsset record
    const asset = await saveYouTubeVideo({ videoId, panelType, lessonId, language })
    return NextResponse.json({ success: true, data: asset })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
```

- [ ] **Step 3: Commit if created**

```bash
git add app/api/media/youtube/route.ts
git commit -m "feat: YouTube media save API route with auth guard"
```

---

## Quick Reference: CSS Variables Used

From `app/globals.css` and the design spec:
- `--alya-purple` — primary purple (#6B4FA0)
- `--alya-purple-light` — border/highlight color
- `--alya-purple-mid` — medium purple for file icons (~#9B72CF)
- `--alya-purple-dark` — dark headings
- `--alya-purple-pale` — very light hover background
- `--font-display` — Fraunces serif font

If `--alya-purple-mid` or `--alya-purple-pale` are not in `globals.css`, add them or use the fallback values shown in the component code (`text-[var(--alya-purple-mid,#9B72CF)]`).
