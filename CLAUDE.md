# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development
npm run dev          # Start Next.js dev server

# Build & Production
npm run build        # Build for production
npm run start        # Start production server

# Linting
npm run lint         # Run ESLint

# Database
npx prisma migrate dev       # Run migrations in development
npx prisma migrate deploy    # Apply migrations in production
npx prisma studio            # Open Prisma Studio GUI
npx prisma generate          # Regenerate Prisma client after schema changes
npx prisma db seed           # Seed database (uses ts-node prisma/seed.ts)
```

## Architecture

**Alya** is a multimodal e-learning platform for deaf and non-verbal children, built with Next.js 16 App Router. Lessons are presented in four simultaneous panels: lip-reading video, sign language video, concept image, and text — in English, Tamil, or Hindi.

### Key Patterns

**Server vs. Client boundary:**
- `/server/` — server-only code (database repositories, media services). Never import in client components.
- `/client/` — client-only code (React hooks, API client utilities). Never import in server components.
- `/lib/` — shared utilities safe on either side (`prisma.ts`, `utils.ts`, `auth.config.ts`).

**Data flow:** API Routes (`/app/api/`) call repository functions from `/server/`, which use the Prisma singleton at `lib/prisma.ts`. Client components fetch via hooks in `/client/hooks/` that call the API routes.

**State management (Zustand, `/store/`):**
- `userStore` — logged-in user, active child profile, language preference (`EN`/`TA`/`HI`)
- `lessonStore` — current lesson slug/word, lesson list for navigation (next/prev)
- `panelStore` — which of the 4 lesson panels are minimized (`lip`/`image`/`text`/`sign`)

**Route groups:**
- `app/(auth)/` — login, register, forgot-password (unauthenticated)
- `app/(dashboard)/` — role-scoped dashboards: `admin/`, `educator/`, `parent/`
- `app/lesson/[slug]/` — the full-screen 4-panel lesson player

**Curriculum hierarchy:** `Module` → `SubModule` → `Lesson`. Each `Lesson` has `LessonMedia` entries (unique per `panelType` + `language`) pointing to `MediaAsset` records stored in Cloudflare R2.

### Database (PostgreSQL + Prisma)

Key models: `User`, `ChildProfile`, `Module`, `SubModule`, `Lesson`, `LessonMedia`, `MediaAsset`, `LessonProgress`.

Enums:
- `UserRole`: `CHILD`, `PARENT`, `EDUCATOR`, `ADMIN`
- `MediaType`: `LIP_READING_VIDEO`, `CONCEPT_IMAGE`, `SIGN_LANGUAGE_VIDEO`
- `LanguageCode`: `EN`, `TA`, `HI`
- `LessonStatus`: `NOT_STARTED`, `IN_PROGRESS`, `COMPLETED`

Always run `npx prisma generate` after editing `prisma/schema.prisma`.

### Media Storage

Media files are stored on Cloudflare R2 (S3-compatible). Upload flow: client requests a presigned URL from `/api/media/upload-url`, uploads directly to R2, then calls `/api/media/confirm` to persist the `MediaAsset` record. The CDN URL comes from `CF_R2_PUBLIC_DOMAIN`.

### Styling

Tailwind CSS v4 with custom CSS variables defined in `app/globals.css`. Brand palette:
- Primary purple: `--alya-purple` (#6B4FA0)
- Background: `--alya-bg` (#F7F5F2)
- Lesson dark background: `--lesson-bg` (#1A0A2E)

Fonts: **Fraunces** (display/headings) and **DM Sans** (body), loaded from `/public/fonts/`.

Use `cn()` from `lib/utils.ts` (re-exported via `client/utils/cn.ts`) for conditional class merging.

### Environment Variables

```
DATABASE_URL              # PostgreSQL connection string
CF_ACCOUNT_ID             # Cloudflare account ID
CF_R2_ACCESS_KEY_ID       # R2 access key
CF_R2_SECRET_ACCESS_KEY   # R2 secret key
CF_R2_BUCKET_NAME         # R2 bucket name
CF_R2_PUBLIC_DOMAIN       # Public CDN base URL (e.g. https://pub-xxx.r2.dev)
```

### Authentication

Authentication (NextAuth.js) is scaffolded but not yet implemented. `lib/auth.config.ts` and `app/api/auth/[...nextauth]/route.ts` are the integration points. The `User` model has `authProviderId` ready for an OAuth/credentials provider.
