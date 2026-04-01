'use client'

import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import { deleteModule } from '@/app/(dashboard)/educator/actions'

export function DeleteModuleButton({ moduleId }: { moduleId: string }) {
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (confirm('Are you absolutely sure you want to delete this module? This action cannot be undone and will permanently delete all associated lessons, videos, and student progress.')) {
      setIsDeleting(true)
      try {
        await deleteModule(moduleId)
      } catch (err) {
        alert('Failed to delete module')
        setIsDeleting(false)
      }
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={isDeleting}
      className={`flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-600 shadow-sm hover:bg-red-100 transition ${isDeleting ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      <Trash2 className="h-4 w-4" />
      {isDeleting ? 'Deleting...' : 'Delete Module'}
    </button>
  )
}
