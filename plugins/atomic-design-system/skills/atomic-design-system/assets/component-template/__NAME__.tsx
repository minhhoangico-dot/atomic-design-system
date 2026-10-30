import { forwardRef, type HTMLAttributes } from 'react';
import styles from './__NAME__.module.css';

export type __NAME__Props = {
  /** Visual emphasis. Add values only when a real use case needs them. */
  variant?: 'default' | 'emphasis';
  /** Control size; maps to size tokens, never to raw px. */
  size?: 'small' | 'medium' | 'large';
} & HTMLAttributes<HTMLDivElement>;

/**
 * __NAME__ — one sentence on what it is for and when NOT to use it.
 * Level: __LEVEL__. Status: alpha.
 */
export const __NAME__ = forwardRef<HTMLDivElement, __NAME__Props>(function __NAME__(
  { variant = 'default', size = 'medium', className, children, ...rest },
  ref,
) {
  return (
    <div
      ref={ref}
      {...rest}
      className={[styles.__NAME__, className].filter(Boolean).join(' ')}
      data-component="__NAME__"
      data-variant={variant}
      data-size={size}
    >
      {children}
    </div>
  );
});
__NAME__.displayName = '__NAME__';
