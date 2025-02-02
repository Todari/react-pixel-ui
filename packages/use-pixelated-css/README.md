# `use-pixelated-css`

A React hook that transforms CSS styles into a pixelated form.

## Features

- Transforms original CSS styles into pixelated versions
- Automatically updates pixelation when element size changes via ResizeObserver
- Cleans up ResizeObserver when component unmounts
- Can be used internally by UI components like Button to apply pixelated styles

## Installation

```bash
// pnpm
pnpm add @react-pixel-ui/use-pixelated-css

// yarn
yarn add @react-pixel-ui/use-pixelated-css

// npm
npm install @react-pixel-ui/use-pixelated-css
```

## Usage

```tsx
import {useRef} from 'react';
import {usePixelatedCSS} from '@react-pixel-ui/use-pixelated-css';
import {css} from '@emotion/react';

const DemoComponent = () => {
  const ref = useRef(null);
  const divStyle = css`
    border: 1px solid #000;
    border-radius: 16px;
    background: linear-gradient(45deg, #FFDCFF, #FF97FF);
  `;
  const pixelatedCSS = usePixelatedCSS({
    prevCSS: divStyle,
    ref,
    unitPixel: 4,
  });
  return <div ref={ref} css={pixelatedCSS}>Hello, world!</div>;
};
```

## Props
- `prevCSS`: CSS styles before pixelation (required, SerializedStyles)
- `ref`: Reference to the element to be pixelated (required, RefObject)
- `unitPixel`: Pixel unit size (optional(default: 4), number)
