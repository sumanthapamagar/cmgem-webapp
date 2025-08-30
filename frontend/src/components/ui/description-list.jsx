import clsx from 'clsx'

export function DescriptionList({ className, ...props }) {
  return (
    <dl
      {...props}
      className={clsx(
        className,
        'grid grid-cols-1 text-base/6 sm:grid-cols-[min(50%,--spacing(80))_auto] sm:text-sm/6'
      )}
    />
  )
}

export function DescriptionTerm({ className, ...props }) {
  return (
    <dt
      {...props}
      className={clsx(
        className,
        'col-start-1 border-t border-zinc-950/5 pt-3 text-black/80 first:border-none sm:border-t sm:border-zinc-950/5 sm:py-3'
      )}
    />
  )
}

export function DescriptionDetails({ className, ...props }) {
  return (
    <dd
      {...props}
      className={clsx(
        className,
        'pb-3 pt-1 text-black sm:border-t sm:border-zinc-950/5 sm:py-3 sm:nth-2:border-none'
      )}
    />
  )
}
