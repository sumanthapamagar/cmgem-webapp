import * as Headless from '@headlessui/react'
import { clsx } from 'clsx'
import { Link } from './link'

const styles = {
  base: [
    // Base
    'relative cursor-pointer isolate inline-flex items-center justify-center gap-x-2 group/button:rounded-none rounded-lg text-base/6 font-semibold',

    // Sizing
    'px-[calc(--spacing(3.5)-1px)] py-[calc(--spacing(2.5)-1px)] sm:px-[calc(--spacing(3)-1px)] sm:py-[calc(--spacing(1.5)-1px)] sm:text-sm/6',

    // Focus
    'focus:outline-none data-focus:outline data-focus:outline-2 data-focus:outline-offset-2 data-focus:outline-blue-500',

    // Disabled
    'data-disabled:opacity-50',

    // Icon
    '*:data-[slot=icon]:-mx-0.5 *:data-[slot=icon]:my-0.5 *:data-[slot=icon]:size-5 *:data-[slot=icon]:shrink-0 *:data-[slot=icon]:text-(--btn-icon) *:data-[slot=icon]:sm:my-1 *:data-[slot=icon]:sm:size-4 forced-colors:[--btn-icon:ButtonText] forced-colors:data-hover:[--btn-icon:ButtonText]',
  ],
  solid: [
    // Optical border, implemented as the button background to avoid corner artifacts
    'border-transparent bg-(--btn-border) hover:opacity-90 transition-all duration-300',

    // Button background, implemented as foreground layer to stack on top of pseudo-border layer

    // Drop shadow, applied to the inset `before` layer so it blends with the border

    // Shim/overlay, inset to match button foreground and used for hover state + highlight shadow

    // White overlay on hover

    // Disabled
  ],
  outline: [
    // Base
    ' border border-zinc-950/10 text-black/80 data-active:bg-zinc-950/2.5 data-hover:bg-zinc-950/2.5',

    // Icon
    '[--btn-icon:var(--color-zinc-500)] data-active:[--btn-icon:var(--color-zinc-700)] data-hover:[--btn-icon:var(--color-zinc-700)]',
  ],
  plain: [
    // Base
    'border-transparent text-black data-active:bg-zinc-950/5 data-hover:bg-zinc-950/5',

    // Icon
    '[--btn-icon:var(--color-zinc-500)] data-active:[--btn-icon:var(--color-zinc-700)] data-hover:[--btn-icon:var(--color-zinc-700)]',
  ],
  colors: {
    'dark/zinc': [
      'text-white [--btn-bg:var(--color-zinc-900)] [--btn-border:var(--color-zinc-950)]/90 [--btn-hover-overlay:var(--color-white)]/10',
      '[--btn-icon:var(--color-zinc-400)] data-active:[--btn-icon:var(--color-zinc-300)] data-hover:[--btn-icon:var(--color-zinc-300)]',
    ],
    light: [
      'text-black [--btn-bg:white] [--btn-border:var(--color-zinc-950)]/10 [--btn-hover-overlay:var(--color-zinc-950)]/2.5 data-active:[--btn-border:var(--color-zinc-950)]/15 data-hover:[--btn-border:var(--color-zinc-950)]/15',
      '[--btn-icon:var(--color-zinc-500)] data-active:[--btn-icon:var(--color-zinc-700)] data-hover:[--btn-icon:var(--color-zinc-700)]',
    ],
    'dark/white': [
      'text-white [--btn-bg:var(--color-zinc-900)] [--btn-border:var(--color-zinc-950)]/90 [--btn-hover-overlay:var(--color-white)]/10',
      '[--btn-icon:var(--color-zinc-400)] data-active:[--btn-icon:var(--color-zinc-300)] data-hover:[--btn-icon:var(--color-zinc-300)]',
    ],
    white: [
      'text-black[--btn-bg:white] [--btn-border:var(--color-zinc-950)]/10 [--btn-hover-overlay:var(--color-zinc-950)]/2.5 data-active:[--btn-border:var(--color-zinc-950)]/15 data-hover:[--btn-border:var(--color-zinc-950)]/15',
      '[--btn-icon:var(--color-zinc-400)] data-active:[--btn-icon:var(--color-zinc-500)] data-hover:[--btn-icon:var(--color-zinc-500)]',
    ],
    zinc: [
      'text-white [--btn-hover-overlay:var(--color-white)]/10 [--btn-bg:var(--color-zinc-600)] [--btn-border:var(--color-zinc-700)]/90',
      '[--btn-icon:var(--color-zinc-400)] data-active:[--btn-icon:var(--color-zinc-300)] data-hover:[--btn-icon:var(--color-zinc-300)]',
    ],
    indigo: [
      'text-white [--btn-hover-overlay:var(--color-white)]/10 [--btn-bg:var(--color-indigo-500)] [--btn-border:var(--color-indigo-600)]/90',
      '[--btn-icon:var(--color-indigo-300)] data-active:[--btn-icon:var(--color-indigo-200)] data-hover:[--btn-icon:var(--color-indigo-200)]',
    ],
    cyan: [
      'text-cyan-950 [--btn-bg:var(--color-cyan-300)] [--btn-border:var(--color-cyan-400)]/80 [--btn-hover-overlay:var(--color-white)]/25',
      '[--btn-icon:var(--color-cyan-500)]',
    ],
    red: [
      'text-white [--btn-hover-overlay:var(--color-white)]/10 [--btn-bg:var(--color-red-600)] [--btn-border:var(--color-red-700)]/90',
      '[--btn-icon:var(--color-red-300)] data-active:[--btn-icon:var(--color-red-200)] data-hover:[--btn-icon:var(--color-red-200)]',
    ],
    orange: [
      'text-white [--btn-hover-overlay:var(--color-white)]/10 [--btn-bg:var(--color-orange-500)] [--btn-border:var(--color-orange-600)]/90',
      '[--btn-icon:var(--color-orange-300)] data-active:[--btn-icon:var(--color-orange-200)] data-hover:[--btn-icon:var(--color-orange-200)]',
    ],
    amber: [
      'text-amber-950 [--btn-hover-overlay:var(--color-white)]/25 [--btn-bg:var(--color-amber-400)] [--btn-border:var(--color-amber-500)]/80',
      '[--btn-icon:var(--color-amber-600)]',
    ],
    yellow: [
      'text-yellow-950 [--btn-hover-overlay:var(--color-white)]/25 [--btn-bg:var(--color-yellow-300)] [--btn-border:var(--color-yellow-400)]/80',
      '[--btn-icon:var(--color-yellow-600)] data-active:[--btn-icon:var(--color-yellow-700)] data-hover:[--btn-icon:var(--color-yellow-700)]',
    ],
    lime: [
      'text-lime-950 [--btn-hover-overlay:var(--color-white)]/25 [--btn-bg:var(--color-lime-300)] [--btn-border:var(--color-lime-400)]/80',
      '[--btn-icon:var(--color-lime-600)] data-active:[--btn-icon:var(--color-lime-700)] data-hover:[--btn-icon:var(--color-lime-700)]',
    ],
    green: [
      'text-white [--btn-hover-overlay:var(--color-white)]/10 [--btn-bg:var(--color-green-600)] [--btn-border:var(--color-green-700)]/90',
      '[--btn-icon:var(--color-white)]/60 data-active:[--btn-icon:var(--color-white)]/80 data-hover:[--btn-icon:var(--color-white)]/80',
    ],
    emerald: [
      'text-white [--btn-hover-overlay:var(--color-white)]/10 [--btn-bg:var(--color-emerald-600)] [--btn-border:var(--color-emerald-700)]/90',
      '[--btn-icon:var(--color-white)]/60 data-active:[--btn-icon:var(--color-white)]/80 data-hover:[--btn-icon:var(--color-white)]/80',
    ],
    teal: [
      'text-white [--btn-hover-overlay:var(--color-white)]/10 [--btn-bg:var(--color-teal-600)] [--btn-border:var(--color-teal-700)]/90',
      '[--btn-icon:var(--color-white)]/60 data-active:[--btn-icon:var(--color-white)]/80 data-hover:[--btn-icon:var(--color-white)]/80',
    ],
    sky: [
      'text-white [--btn-hover-overlay:var(--color-white)]/10 [--btn-bg:var(--color-sky-500)] [--btn-border:var(--color-sky-600)]/80',
      '[--btn-icon:var(--color-zinc-400)] data-active:[--btn-icon:var(--color-zinc-300)] data-hover:[--btn-icon:var(--color-zinc-300)]',
    ],
    blue: [
      'text-white [--btn-hover-overlay:var(--color-white)]/10 [--btn-bg:var(--color-blue-600)] [--btn-border:var(--color-blue-700)]/90',
      '[--btn-icon:var(--color-blue-400)] data-active:[--btn-icon:var(--color-blue-300)] data-hover:[--btn-icon:var(--color-blue-300)]',
    ],
    violet: [
      'text-white [--btn-hover-overlay:var(--color-white)]/10 [--btn-bg:var(--color-violet-500)] [--btn-border:var(--color-violet-600)]/90',
      '[--btn-icon:var(--color-violet-300)] data-active:[--btn-icon:var(--color-violet-200)] data-hover:[--btn-icon:var(--color-violet-200)]',
    ],
    purple: [
      'text-white [--btn-hover-overlay:var(--color-white)]/10 [--btn-bg:var(--color-purple-500)] [--btn-border:var(--color-purple-600)]/90',
      '[--btn-icon:var(--color-purple-300)] data-active:[--btn-icon:var(--color-purple-200)] data-hover:[--btn-icon:var(--color-purple-200)]',
    ],
    fuchsia: [
      'text-white [--btn-hover-overlay:var(--color-white)]/10 [--btn-bg:var(--color-fuchsia-500)] [--btn-border:var(--color-fuchsia-600)]/90',
      '[--btn-icon:var(--color-fuchsia-300)] data-active:[--btn-icon:var(--color-fuchsia-200)] data-hover:[--btn-icon:var(--color-fuchsia-200)]',
    ],
    pink: [
      'text-white [--btn-hover-overlay:var(--color-white)]/10 [--btn-bg:var(--color-pink-500)] [--btn-border:var(--color-pink-600)]/90',
      '[--btn-icon:var(--color-pink-300)] data-active:[--btn-icon:var(--color-pink-200)] data-hover:[--btn-icon:var(--color-pink-200)]',
    ],
    rose: [
      'text-white [--btn-hover-overlay:var(--color-white)]/10 [--btn-bg:var(--color-rose-500)] [--btn-border:var(--color-rose-600)]/90',
      '[--btn-icon:var(--color-rose-300)] data-active:[--btn-icon:var(--color-rose-200)] data-hover:[--btn-icon:var(--color-rose-200)]',
    ],
    "true-navy": [
      'text-white [--btn-hover-overlay:var(--color-white)]/10 [--btn-bg:var(--color-true-navy)] [--btn-border:var(--color-true-navy)]/90',
      '[--btn-icon:var(--color-true-navy-300)] data-active:[--btn-icon:var(--color-true-navy-200)] data-hover:[--btn-icon:var(--color-true-navy-200)]',
    ],
    "blue-door": [
      'text-white [--btn-hover-overlay:var(--color-white)]/10 [--btn-bg:var(--color-blue-door)] [--btn-border:var(--color-blue-door)]/90',
      '[--btn-icon:var(--color-blue-door-300)] data-active:[--btn-icon:var(--color-blue-door-200)] data-hover:[--btn-icon:var(--color-blue-door-200)]',
    ],
    "harper-blue": [
      'text-white [--btn-hover-overlay:var(--color-white)]/10 [--btn-bg:var(--color-harper-blue)] [--btn-border:var(--color-harper-blue)]/90',
      '[--btn-icon:var(--color-harper-blue-300)] data-active:[--btn-icon:var(--color-harper-blue-200)] data-hover:[--btn-icon:var(--color-harper-blue-200)]',
    ],
  },
}

export const Button = React.forwardRef(function Button({ color, outline, plain, className, children, ...props }, ref) {
  let classes = clsx(
    className,
    styles.base,
    outline ? styles.outline : plain ? styles.plain : clsx(styles.solid, styles.colors[color ?? 'dark/zinc'])
  )

  return 'href' in props ? (
    <Link {...props} className={classes} ref={ref}>
      <TouchTarget>{children}</TouchTarget>
    </Link>
  ) : (
    <Headless.Button {...props} className={clsx(classes, 'cursor-default')} ref={ref}>
      <TouchTarget>{children}</TouchTarget>
    </Headless.Button>
  )
})

/**
 * ButtonGroup component that groups buttons together
 * Only the first button has left rounded corners, only the last button has right rounded corners
 * Middle buttons have no rounded corners to create a seamless group appearance
 */
export const ButtonGroup = React.forwardRef(function ButtonGroup({ className, children, ...props }, ref) {
  // Clone children and modify their border radius classes
  const modifiedChildren = React.Children.map(children, (child, index) => {
    if (!React.isValidElement(child)) return child;

    const isFirst = index === 0;
    const isLast = index === React.Children.count(children) - 1;
    
    // Remove default rounded corners from all buttons
    let childClassName = child.props.className || '';
    childClassName = childClassName.replace(/rounded-[^\\s]*/g, '');
    
    // Add appropriate border radius based on position
    if (isFirst) {
      childClassName = clsx(childClassName, 'rounded-r-none rounded-l-lg');
    }
    if (isLast) {
      childClassName = clsx(childClassName, 'rounded-r-lg rounded-l-none');
    }
    
    // Remove border radius from middle buttons (neither first nor last)
    if (!isFirst && !isLast) {
      childClassName = clsx(childClassName, 'rounded-none');
    }
    

    return React.cloneElement(child, {
      ...child.props,
      className: childClassName,
    });
  });

  return (
    <div 
      ref={ref}
      className={clsx('inline-flex group/button-group divide-x divide-stone-300', className)}
      {...props}
    >
      {modifiedChildren}
    </div>
  );
});

/* Expand the hit area to at least 44×44px on touch devices */
export function TouchTarget({ children }) {
  return (
    <>
      {children}
      <span
        className="absolute left-1/2 top-1/2 size-[max(100%,2.75rem)] -translate-x-1/2 -translate-y-1/2 pointer-fine:hidden"
        aria-hidden="true"
      />
    </>
  )
}