import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import {
  PixelConfigProvider,
  usePixelConfig,
} from './PixelConfigProvider';

function ConfigProbe() {
  const config = usePixelConfig();
  return (
    <div data-testid="probe">
      {config.pixelSize}|{config.borderColor ?? 'none'}
    </div>
  );
}

describe('PixelConfigProvider', () => {
  it('provides the default config without a provider', () => {
    render(<ConfigProbe />);
    expect(screen.getByTestId('probe').textContent).toBe('4|none');
  });

  it('overrides pixelSize via config prop', () => {
    render(
      <PixelConfigProvider config={{ pixelSize: 8 }}>
        <ConfigProbe />
      </PixelConfigProvider>,
    );
    expect(screen.getByTestId('probe').textContent).toBe('8|none');
  });

  it('supports borderColor', () => {
    render(
      <PixelConfigProvider config={{ pixelSize: 6, borderColor: '#333' }}>
        <ConfigProbe />
      </PixelConfigProvider>,
    );
    expect(screen.getByTestId('probe').textContent).toBe('6|#333');
  });

  it('allows nested providers to override', () => {
    render(
      <PixelConfigProvider config={{ pixelSize: 4 }}>
        <PixelConfigProvider config={{ pixelSize: 12 }}>
          <ConfigProbe />
        </PixelConfigProvider>
      </PixelConfigProvider>,
    );
    expect(screen.getByTestId('probe').textContent).toBe('12|none');
  });

  it('preserves identical reference across re-renders with same primitives', () => {
    const configs: unknown[] = [];
    function Capture() {
      const config = usePixelConfig();
      configs.push(config);
      return null;
    }

    const { rerender } = render(
      <PixelConfigProvider config={{ pixelSize: 8 }}>
        <Capture />
      </PixelConfigProvider>,
    );
    rerender(
      <PixelConfigProvider config={{ pixelSize: 8 }}>
        <Capture />
      </PixelConfigProvider>,
    );
    // Same primitive values → memoized merge returns the same object
    expect(configs.length).toBeGreaterThanOrEqual(2);
    expect(configs[0]).toBe(configs[1]);
  });
});
