'use client'

interface LoadingSpinnerProps {
  text?: string;
}

export default function LoadingSpinner({ text }: LoadingSpinnerProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-4">
      <div className="spinner" />
      {text && (
        <p className="text-sm text-gray-400">{text}</p>
      )}
    </div>
  )
}