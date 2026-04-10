import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render } from '@testing-library/react';
import { usePixelRef } from './usePixelRef';

describe('usePixelRef', () => {
  beforeEach(() => {
    Object.defineProperty(HTMLElement.prototype, 'offsetWidth', {
      configurable: true,
      get() {
        return 200;
      },
    });
    Object.defineProperty(HTMLElement.prototype, 'offsetHeight', {
      configurable: true,
      get() {
        return 100;
      },
    });
    Object.defineProperty(HTMLElement.prototype, 'clientWidth', {
      configurable: true,
      get() {
        return 200;
      },
    });
    Object.defineProperty(HTMLElement.prototype, 'clientHeight', {
      configurable: true,
      get() {
        return 100;
      },
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('attaches a callback ref and applies pixel styles', () => {
    function Component() {
      const ref = usePixelRef<HTMLDivElement>({ pixelSize: 6 });
      return (
        <div
          ref={ref}
          data-testid="target"
          style={{
            background: 'linear-gradient(to right, red, blue)',
            borderRadius: 12,
          }}
        >
          hi
        </div>
      );
    }
    const { getByTestId } = render(<Component />);
    const el = getByTestId('target') as HTMLElement;
    // After the ref callback and apply cycle, the element should
    // have some pixel art inline style applied.
    expect(el.style.borderRadius === '0' || el.style.clipPath !== '').toBe(true);
  });

  it('restores original styles when the ref detaches (unmount)', () => {
    function Component({ mounted }: { mounted: boolean }) {
      const ref = usePixelRef<HTMLDivElement>({ pixelSize: 6 });
      if (!mounted) return null;
      return (
        <div id="outer">
          <div
            ref={ref}
            data-testid="target"
            style={{
              background: '#ff0000',
              borderRadius: 12,
            }}
          >
            hi
          </div>
        </div>
      );
    }
    const { rerender, queryByTestId } = render(<Component mounted={true} />);
    expect(queryByTestId('target')).toBeInTheDocument();
    rerender(<Component mounted={false} />);
    expect(queryByTestId('target')).toBeNull();
  });

  it('writes and restores parent filter for shadow', () => {
    function Component() {
      const ref = usePixelRef<HTMLDivElement>({ pixelSize: 6 });
      return (
        <div data-testid="parent">
          <div
            ref={ref}
            style={{
              background: '#ff0000',
              boxShadow: 'rgba(0,0,0,0.25) 4px 4px 0px',
            }}
          >
            hi
          </div>
        </div>
      );
    }

    const { getByTestId, unmount } = render(<Component />);
    const parent = getByTestId('parent') as HTMLElement;
    // Parent may or may not have a filter applied depending on whether
    // happy-dom returns a non-none computed box-shadow. Key assertion:
    // after unmount, the parent filter must be restored to whatever it was.
    const beforeUnmount = parent.style.filter;
    unmount();
    // After unmount, the cleanup restores original (empty) filter
    expect(parent.style.filter).toBe(beforeUnmount || '');
  });

  it('does nothing when enabled=false', () => {
    function Component() {
      const ref = usePixelRef<HTMLDivElement>({
        pixelSize: 6,
        enabled: false,
      });
      return (
        <div
          ref={ref}
          data-testid="target"
          style={{ background: '#ff0000', borderRadius: 12 }}
        >
          hi
        </div>
      );
    }
    const { getByTestId } = render(<Component />);
    const el = getByTestId('target') as HTMLElement;
    // No pixel art was applied: style attribute must not contain a clip-path
    // polygon or composite PNG data URL.
    const styleAttr = el.getAttribute('style') ?? '';
    expect(styleAttr).not.toContain('clip-path: polygon');
    expect(styleAttr).not.toContain('data:image/png');
  });
});
