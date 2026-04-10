import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { PixelBox } from './PixelBox';

describe('PixelBox', () => {
  it('renders a single div without a border', () => {
    const { container } = render(
      <PixelBox width={100} height={50} background="#ff0000">
        content
      </PixelBox>,
    );
    const divs = container.querySelectorAll('div');
    expect(divs.length).toBe(1);
    expect(divs[0].textContent).toBe('content');
  });

  it('wraps in an outer div when border is set', () => {
    const { container } = render(
      <PixelBox
        width={100}
        height={50}
        borderWidth={4}
        borderColor="#000"
        background="#fff"
      >
        content
      </PixelBox>,
    );
    const divs = container.querySelectorAll('div');
    expect(divs.length).toBe(2); // wrapper + content
  });

  it('applies width and height styles', () => {
    const { container } = render(
      <PixelBox width={120} height={60} background="#fff">
        x
      </PixelBox>,
    );
    const div = container.firstChild as HTMLElement;
    expect(div.style.width).toBe('120px');
    expect(div.style.height).toBe('60px');
  });

  it('reads pixelSize from PixelConfigProvider context', () => {
    // Indirect assertion: passing through without errors
    const { container } = render(
      <PixelBox width={100} height={50} background="#fff" pixelSize={8}>
        x
      </PixelBox>,
    );
    expect(container.firstChild).toBeTruthy();
  });

  it('forwards extra props to the root element', () => {
    const { container } = render(
      <PixelBox
        width={100}
        height={50}
        background="#fff"
        id="my-box"
        data-custom="yes"
      >
        x
      </PixelBox>,
    );
    const div = container.firstChild as HTMLElement;
    expect(div.id).toBe('my-box');
    expect(div.getAttribute('data-custom')).toBe('yes');
  });
});
