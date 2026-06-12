import { describe, it, expect, vi } from 'vitest';
import { fireEvent, render } from '@testing-library/react';
import { PixelButton } from './PixelButton';

describe('PixelButton', () => {
  it('renders a <button> element', () => {
    const { getByRole } = render(<PixelButton>Click</PixelButton>);
    expect(getByRole('button').textContent).toBe('Click');
  });

  it('forwards onClick handler', () => {
    const handler = vi.fn();
    const { getByRole } = render(
      <PixelButton onClick={handler}>Click</PixelButton>,
    );
    fireEvent.click(getByRole('button'));
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('supports primary/secondary/danger variants', () => {
    const { rerender, getByRole } = render(
      <PixelButton variant="primary">P</PixelButton>,
    );
    expect(getByRole('button')).toBeInTheDocument();
    rerender(<PixelButton variant="secondary">S</PixelButton>);
    expect(getByRole('button')).toBeInTheDocument();
    rerender(<PixelButton variant="danger">D</PixelButton>);
    expect(getByRole('button')).toBeInTheDocument();
  });

  it('passes through HTML button attributes', () => {
    const { getByRole } = render(
      <PixelButton type="submit" disabled>
        Submit
      </PixelButton>,
    );
    const btn = getByRole('button') as HTMLButtonElement;
    expect(btn.type).toBe('submit');
    expect(btn.disabled).toBe(true);
  });
});

describe('PixelButton — robustness', () => {
  it('falls back to primary on an unknown variant instead of crashing', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const { getByRole } = render(
      // @ts-expect-error intentional: plain-JS callers can pass anything
      <PixelButton variant="Primary">oops</PixelButton>,
    );
    expect(getByRole('button')).toBeInTheDocument();
    expect(warn.mock.calls.flat().join(' ')).toContain('Unknown PixelButton variant');
    warn.mockRestore();
  });

  it('defaults to type="button" so it does not submit forms', () => {
    const { getByRole } = render(<PixelButton>Go</PixelButton>);
    expect((getByRole('button') as HTMLButtonElement).type).toBe('button');
  });

  it('exposes a stable displayName for DevTools', () => {
    expect(PixelButton.displayName).toBe('PixelButton');
  });
});
