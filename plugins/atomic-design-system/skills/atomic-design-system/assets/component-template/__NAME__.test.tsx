import { createRef } from 'react';
import { render, screen } from '@testing-library/react';
import { __NAME__ } from './__NAME__';

describe('__NAME__', () => {
  it('renders children', () => {
    render(<__NAME__>Xin chào</__NAME__>);
    expect(screen.getByText('Xin chào')).toBeInTheDocument();
  });

  it('forwards ref, merges className, exposes variant as data attribute', () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <__NAME__ ref={ref} className="extra" variant="emphasis">
        x
      </__NAME__>,
    );
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
    expect(ref.current).toHaveClass('extra');
    expect(ref.current).toHaveAttribute('data-variant', 'emphasis');
  });
});
