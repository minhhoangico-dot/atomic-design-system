import { forwardRef, type ButtonHTMLAttributes } from 'react';
import styles from './Button.module.css';

export type ButtonProps = { variant?: 'primary' | 'secondary' } & ButtonHTMLAttributes<HTMLButtonElement>;

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'secondary', className, type = 'button', ...rest },
  ref,
) {
  return (
    <button ref={ref} type={type} {...rest} className={[styles.Button, className].filter(Boolean).join(' ')} data-variant={variant} />
  );
});
