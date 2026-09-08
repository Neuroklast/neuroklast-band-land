'use client'

interface ConfirmDeleteButtonProps {
  message?: string
  className?: string
  children?: React.ReactNode
}

export function ConfirmDeleteButton({
  message = 'Delete this item? This cannot be undone.',
  className = 'inline-flex min-h-[44px] items-center px-2 text-sm text-red-400 hover:text-red-300 transition-colors',
  children = 'Delete',
}: ConfirmDeleteButtonProps) {
  return (
    <button
      type="submit"
      className={className}
      onClick={(event) => {
        if (!confirm(message)) event.preventDefault()
      }}
    >
      {children}
    </button>
  )
}
