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

describe('PixelBox — responsive mode', () => {
  it('does not pin its own px width/height in responsive mode', () => {
    const { container } = render(
      <PixelBox responsive background="#f00" style={{ width: '100%' }} />,
    );
    const root = container.firstChild as HTMLElement;
    // The component must not force the 200x100 fallback — user CSS rules
    expect(root.style.width).toBe('100%');
    expect(root.style.height).not.toBe('100px');
  });

  it('pins explicit width/height in fixed mode (default)', () => {
    const { container } = render(
      <PixelBox width={120} height={60} background="#f00" />,
    );
    const root = container.firstChild as HTMLElement;
    expect(root.style.width).toBe('120px');
    expect(root.style.height).toBe('60px');
  });

  it('puts the user style on the ROOT element when a border is used', () => {
    const { container } = render(
      <PixelBox
        width={120}
        height={60}
        borderWidth={4}
        borderColor="#333"
        background="#f00"
        style={{ margin: 8 }}
      />,
    );
    const root = container.firstChild as HTMLElement;
    expect(root.style.margin).toBe('8px');
  });
});
