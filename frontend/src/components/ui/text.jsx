import { clsx } from 'clsx'
import { Link } from './link'

export function Text({ className, ...props }) {
  return (
    <p
      data-slot="text"
      {...props}
      className={clsx(className, 'text-base/6 text-zinc-500 sm:text-sm/6')}
    />
  )
}

export function TextLink({ className, ...props }) {
  return (
    <Link
      {...props}
      className={clsx(
        className,
        'text-zinc-950 underline decoration-zinc-950/50 data-hover:decoration-zinc-950'
      )}
    />
  )
}

export function Strong({ className, ...props }) {
  return <strong {...props} className={clsx(className, 'font-medium text-zinc-950')} />
}

export function Code({ className, ...props }) {
  return (
    <code
      {...props}
      className={clsx(
        className,
        'rounded border border-zinc-950/10 bg-zinc-950/2.5 px-0.5 text-sm font-medium text-zinc-950 sm:text-[0.8125rem]'
      )}
    />
  )
}
