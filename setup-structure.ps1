# Alya — Complete File Structure Setup Script
# Run this from your project root: D:\projects\alya
# Command: .\setup-structure.ps1

Write-Host "Creating Alya file structure..." -ForegroundColor Cyan

# ─── HELPER FUNCTION ───
function New-File($path) {
    $dir = Split-Path $path
    if ($dir -and !(Test-Path $dir)) {
        New-Item -ItemType Directory -Force -Path $dir | Out-Null
    }
    if (!(Test-Path $path)) {
        New-Item -ItemType File -Force -Path $path | Out-Null
    }
}

# ─── APP PAGES ───
New-File "app/(auth)/login/page.tsx"
New-File "app/(auth)/register/page.tsx"
New-File "app/(auth)/forgot-password/page.tsx"

New-File "app/(dashboard)/layout.tsx"
New-File "app/(dashboard)/admin/page.tsx"
New-File "app/(dashboard)/admin/content/page.tsx"
New-File "app/(dashboard)/admin/users/page.tsx"
New-File "app/(dashboard)/admin/analytics/page.tsx"
New-File "app/(dashboard)/educator/page.tsx"
New-File "app/(dashboard)/educator/lessons/page.tsx"
New-File "app/(dashboard)/educator/students/page.tsx"
New-File "app/(dashboard)/parent/page.tsx"
New-File "app/(dashboard)/parent/children/page.tsx"
New-File "app/(dashboard)/parent/progress/[childId]/page.tsx"

New-File "app/module/[slug]/page.tsx"
New-File "app/lesson/[slug]/page.tsx"
New-File "app/my-path/page.tsx"
New-File "app/library/page.tsx"
New-File "app/profile/page.tsx"
New-File "app/progress/page.tsx"
New-File "app/not-found.tsx"
New-File "app/error.tsx"

# ─── APP API ROUTES ───
New-File "app/api/auth/[...nextauth]/route.ts"
New-File "app/api/modules/route.ts"
New-File "app/api/modules/[id]/route.ts"
New-File "app/api/lessons/route.ts"
New-File "app/api/lessons/[id]/route.ts"
New-File "app/api/progress/route.ts"
New-File "app/api/users/route.ts"
New-File "app/api/users/[id]/children/route.ts"
New-File "app/api/media/upload-url/route.ts"
New-File "app/api/media/confirm/route.ts"
New-File "app/api/media/youtube/route.ts"

# ─── COMPONENTS ───
New-File "components/layout/Navbar.tsx"
New-File "components/layout/BottomNav.tsx"
New-File "components/layout/Sidebar.tsx"
New-File "components/layout/PageShell.tsx"

New-File "components/lesson/SplitScreen.tsx"
New-File "components/lesson/PanelLipReading.tsx"
New-File "components/lesson/PanelImage.tsx"
New-File "components/lesson/PanelText.tsx"
New-File "components/lesson/PanelSignLanguage.tsx"
New-File "components/lesson/MinimizedPanel.tsx"
New-File "components/lesson/LessonNav.tsx"
New-File "components/lesson/LessonComplete.tsx"

New-File "components/curriculum/ModuleCard.tsx"
New-File "components/curriculum/LessonCard.tsx"
New-File "components/curriculum/ProgressBar.tsx"
New-File "components/curriculum/LanguageSelector.tsx"
New-File "components/curriculum/ModuleGrid.tsx"

New-File "components/dashboard/StatsCard.tsx"
New-File "components/dashboard/ProgressChart.tsx"
New-File "components/dashboard/ChildProfileCard.tsx"
New-File "components/dashboard/RecentActivity.tsx"
New-File "components/dashboard/LessonUploadForm.tsx"

New-File "components/auth/LoginForm.tsx"
New-File "components/auth/RegisterForm.tsx"
New-File "components/auth/RoleGuard.tsx"

New-File "components/shared/Avatar.tsx"
New-File "components/shared/Badge.tsx"
New-File "components/shared/Modal.tsx"
New-File "components/shared/Toast.tsx"
New-File "components/shared/LoadingSpinner.tsx"
New-File "components/shared/EmptyState.tsx"
New-File "components/shared/ConfirmDialog.tsx"

# ─── SERVER MODULES ───
New-File "server/media/mediaRepository.ts"
New-File "server/media/r2Service.ts"
New-File "server/media/youtubeService.ts"
New-File "server/lessons/lessonRepository.ts"
New-File "server/users/userRepository.ts"
New-File "server/progress/progressRepository.ts"
New-File "server/auth/permissions.ts"

# ─── CLIENT MODULES ───
New-File "client/media/mediaClient.ts"
New-File "client/hooks/useLessonMedia.ts"
New-File "client/hooks/usePanelState.ts"
New-File "client/hooks/useLessonProgress.ts"
New-File "client/hooks/usePanelTimer.ts"
New-File "client/hooks/useChildProfile.ts"
New-File "client/utils/mediaHelpers.ts"
New-File "client/utils/cn.ts"

# ─── STORE ───
New-File "store/panelStore.ts"
New-File "store/userStore.ts"
New-File "store/lessonStore.ts"

# ─── TYPES ───
New-File "types/index.ts"
New-File "types/curriculum.ts"
New-File "types/user.ts"
New-File "types/media.ts"
New-File "types/progress.ts"

# ─── LIB ───
New-File "lib/prisma.ts"
New-File "lib/auth.config.ts"
New-File "lib/utils/formatters.ts"
New-File "lib/utils/validators.ts"

# ─── PRISMA ───
New-File "prisma/seed.ts"

# ─── PUBLIC ───
New-File "public/icons/.gitkeep"
New-File "public/fonts/.gitkeep"
New-File "public/images/.gitkeep"

# ─── ROOT CONFIG FILES ───
New-File ".env.production"
New-File "README.md"

Write-Host ""
Write-Host "Done! All folders and files created." -ForegroundColor Green
Write-Host ""
Write-Host "Your structure:" -ForegroundColor Yellow
Write-Host "  app/          - Pages and API routes"
Write-Host "  components/   - Reusable UI components"
Write-Host "  server/       - DB + R2 (server only)"
Write-Host "  client/       - Hooks + API callers (browser only)"
Write-Host "  store/        - Zustand global state"
Write-Host "  types/        - TypeScript types"
Write-Host "  lib/          - Utilities and config"
Write-Host "  prisma/       - Database schema and seed"
Write-Host ""
Write-Host "Next: paste your code into each file then git push!" -ForegroundColor Cyan
