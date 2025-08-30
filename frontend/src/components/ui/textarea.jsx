import * as Headless from '@headlessui/react'
import { clsx } from 'clsx'
import { forwardRef } from 'react'

export const Textarea = forwardRef(function Textarea({ className, resizable = true, ...props }, ref) {
  return (
    <span
      data-slot="control"
      className={clsx([
        className,
        // Basic layout
        'relative block w-full',
        // Background color + shadow applied to inset pseudo element, so shadow blends with border in light mode
        'before:absolute before:inset-px before:rounded-[calc(var(--radius-lg)-1px)] before:bg-white before:shadow',
        // Focus ring
        'after:pointer-events-none after:absolute after:inset-0 after:rounded-lg after:ring-inset after:ring-transparent sm:after:focus-within:ring-2 sm:after:focus-within:ring-blue-500',
        // Disabled state
        'has-data-disabled:opacity-50 before:has-data-disabled:bg-zinc-950/5 before:has-data-disabled:shadow-none',
      ])}
    >
      <Headless.Textarea
        ref={ref}
        {...props}
        className={clsx([
          // Basic layout
          'relative block h-full w-full appearance-none rounded-lg px-[calc(--spacing(3.5)-1px)] py-[calc(--spacing(2.5)-1px)] sm:px-[calc(--spacing(3)-1px)] sm:py-[calc(--spacing(1.5)-1px)]',
          // Typography
          'text-base/6 text-zinc-950 placeholder:text-zinc-500 sm:text-sm/6',
          // Border
          'border border-zinc-950/10 data-hover:border-zinc-950/20',
          // Background color
          'bg-transparent',
          // Hide default focus styles
          'focus:outline-none',
          // Invalid state
          'data-invalid:border-red-500 data-invalid:data-hover:border-red-500',
          // Disabled state
          'disabled:border-zinc-950/20',
          // Resizable
          resizable ? 'resize-y' : 'resize-none',
        ])}
      />
    </span>
  )
})
