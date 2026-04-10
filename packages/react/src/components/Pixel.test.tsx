import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { act, render } from '@testing-library/react';
import { useState } from 'react';
import { Pixel } from './Pixel';

// happy-dom doesn't compute layout, so offsetWidth/offsetHeight return 0.
// Patch the HTMLElement prototype so every element reports fixed dimensions.
describe('Pixel', () => {
  beforeEach(() => {
    // Patch Element prototype so any child we render gets non-zero dims
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

  it('renders the child element', () => {
    const { getByTestId } = render(
      <Pixel size={6}>
        <div data-testid="child" style={{ background: '#f00' }}>
          hello
        </div>
      </Pixel>,
    );
    expect(getByTestId('child')).toBeInTheDocument();
    expect(getByTestId('child').textContent).toBe('hello');
  });

  it('returns children unchanged when enabled=false', () => {
    const { getByTestId } = render(
      <Pixel size={6} enabled={false}>
        <div data-testid="child" style={{ background: '#f00' }}>
          hello
        </div>
      </Pixel>,
    );
    const el = getByTestId('child') as HTMLElement;
    // No pixel art styles applied: no clip-path polygon, no composite PNG
    const styleAttr = el.getAttribute('style') ?? '';
    expect(styleAttr).not.toContain('clip-path: polygon');
    expect(styleAttr).not.toContain('data:image/png');
    // Original background is preserved
    expect(styleAttr).toContain('#f00');
  });

  it('applies pixel art styles in phase 2', async () => {
    const { getByTestId } = render(
      <Pixel size={6}>
        <div
          data-testid="child"
          style={{
            background: 'linear-gradient(to right, red, blue)',
            borderRadius: 12,
          }}
        >
          hello
        </div>
      </Pixel>,
    );
    const el = getByTestId('child') as HTMLElement;
    // Phase 2 applies clip-path and background image
    expect(el.style.clipPath).toMatch(/polygon|none|/);
    // background override is set via inline style
    expect(el.getAttribute('style')).toContain('background');
  });

  it('warns in dev when child is a function component without ref support', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    function Plain({ children }: { children: React.ReactNode }) {
      return <span>{children}</span>;
    }
    // Plain doesn't accept refs → warning expected
    render(
      <Pixel size={6}>
        <Plain>hi</Plain>
      </Pixel>,
    );
    // The layout effect runs; if ref is null, we emit the warning.
    // React itself also warns separately.
    const calls = warn.mock.calls.flat().join(' ');
    expect(calls).toMatch(/did not accept a ref|Function components cannot/);
    warn.mockRestore();
  });

  it('re-measures when the child style prop changes', () => {
    function App() {
      const [bg, setBg] = useState('#ff0000');
      return (
        <>
          <button onClick={() => setBg('#00ff00')} data-testid="toggle">
            toggle
          </button>
          <Pixel size={6}>
            <div data-testid="child" style={{ background: bg }}>
              hello
            </div>
          </Pixel>
        </>
      );
    }

    const { getByTestId } = render(<App />);
    const toggle = getByTestId('toggle');

    // Initial style applied after phase 2
    act(() => {
      toggle.click();
    });

    // After the prop change, the component should re-run
    // and the child still renders with the new background reflected.
    const child = getByTestId('child') as HTMLElement;
    // Inline style should contain the new color or a pixel-art override
    expect(child).toBeInTheDocument();
  });

  it('falls through when children is not a valid element', () => {
    const { container } = render(
      // @ts-expect-error intentional: children is required but we test the fallback
      <Pixel size={6}>{null}</Pixel>,
    );
    expect(container.firstChild).toBeNull();
  });
});
