/** @jsxImportSource @emotion/react */
import type {Meta, StoryObj} from '@storybook/react';
import {useRef} from 'react';
import {usePixelatedCSS} from '@react-pixel-ui/use-pixelated-css';
import {css} from '@emotion/react';

const DemoComponent = ({
  width = 128,
  height = 48,
  background = 'linear-gradient(45deg, #FFDCFF, #FF97FF)',
  border,
  borderRadius,
  unitPixel = 4
}: {
  width?: number;
  height?: number;
  background?: string;
  border?: string;
  borderRadius?: number;
  unitPixel?: number;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const prevCSS = css`
    width: ${width}px;
    height: ${height}px;
    background: ${background};
    ${border ? `border: ${border};` : ''}
    ${borderRadius ? `border-radius: ${borderRadius}px;` : ''}
  `;

  const pixelatedCSS = usePixelatedCSS({
    prevCSS,
    ref,
    unitPixel
  });

  return <div ref={ref} css={pixelatedCSS} />;
};

const meta = {
  title: 'use-pixelated-css/usePixelatedCSS',
  component: DemoComponent,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
The usePixelatedCSS hook provides functionality to transform CSS styles into a pixelated form.

### Props
- **prevCSS (required)**: Original CSS to be pixelated (SerializedStyles)
- **ref (required)**: Reference to the element to be pixelated (React.RefObject<HTMLElement>)
- **unitPixel (optional default: 4)**: Pixelation unit size

### Usage

\`\`\`tsx
import { useRef } from 'react';
import { css } from '@emotion/react';
import { usePixelatedCSS } from '@react-pixel-ui/use-pixelated-css';

const Component = () => {
  const elementRef = useRef<HTMLDivElement>(null);
  
  const divStyle = css({
    width: '200px',
    height: '100px',
    background: 'linear-gradient(45deg, #FFDCFF, #FF97FF)',
    borderRadius: '16px'
  });

  const pixelatedCSS = usePixelatedCSS({
    prevCSS: divStyle,
    ref: elementRef,
    unitPixel: 4
  });

  return <div ref={elementRef} css={pixelatedCSS} />;
};
\`\`\`

### Features
- Automatically updates pixelation when element size changes through ResizeObserver
- Automatically cleans up ResizeObserver when component unmounts
- Can be used internally in UI components like Button to apply pixelated styles
`,
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    unitPixel: {
      description: '**[Props]** Determines the pixelation unit size',
      control: {type: 'range', min: 4, max: 20, step: 2},
      defaultValue: 4,
    },
    width: {
      description: '**[for playground]** Sets the width of the element',
      control: {type: 'range', min: 16, max: 256, step: 16},
      defaultValue: 128,
    },
    height: {
      description: '**[for playground]** Sets the height of the element',
      control: {type: 'range', min: 4, max: 96, step: 4},
      defaultValue: 48,
    },
    background: {
      description: '**[for playground]** Sets the background',
      control: 'select',
      options: [
        'linear-gradient(45deg, #FFDCFF, #FF97FF)',
        'linear-gradient(90deg, #FFEEFF, #FF97FF)',
        'linear-gradient(180deg, #FFEEFF, #FF97FF)',
        '#FFDCFF',
        '#FF97FF'
      ],
      defaultValue: 'linear-gradient(45deg, #FFDCFF, #FF97FF)',
    },
    border: {
      description: '**[for playground]** Sets the border',
      control: 'select',
      options: [
        undefined,
        '4px solid #8425EC',
        '8px solid #8425EC',
        '12px solid #8425EC'
      ],
    },
    borderRadius: {
      description: '**[for playground]** Sets the border radius',
      control: {type: 'range', min: 0, max: 32, step: 4},
      defaultValue: 16,
    },
  },
} satisfies Meta<typeof DemoComponent>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  args: {
    unitPixel: 4,
    width: 128,
    height: 48,
    background: 'linear-gradient(45deg, #FFDCFF, #FF97FF)',
    border: '4px solid #8425EC',
    borderRadius: 16,
  }
};

export const UnitPixelComparison: Story = {
  render: () => (
    <div style={{display: 'flex', gap: '24px', flexWrap: 'wrap'}}>
      {[1, 4, 8, 12].map((pixel) => (
        <div key={pixel} style={{textAlign: 'center'}}>
          <p style={{margin: '0 0 8px'}}>{pixel}px unit</p>
          <DemoComponent 
            unitPixel={pixel}
            background="linear-gradient(45deg, #FFDCFF, #FF97FF)"
            border={`${pixel}px solid #8425EC`}
            borderRadius={16}
          />
        </div>
      ))}
    </div>
  )
};

export const BackgroundVariations: Story = {
  render: () => (
    <div style={{display: 'flex', gap: '24px', flexWrap: 'wrap'}}>
      <div style={{textAlign: 'center'}}>
        <p style={{margin: '0 0 8px'}}>45° Gradient</p>
        <DemoComponent background="linear-gradient(45deg, #FFDCFF, #FF97FF)" borderRadius={16}/>
      </div>
      <div style={{textAlign: 'center'}}>
        <p style={{margin: '0 0 8px'}}>90° Gradient</p>
        <DemoComponent background="linear-gradient(90deg, #FFEEFF, #FF97FF)" borderRadius={16}/>
      </div>
      <div style={{textAlign: 'center'}}>
        <p style={{margin: '0 0 8px'}}>180° Gradient</p>
        <DemoComponent background="linear-gradient(180deg, #FFEEFF, #FF97FF)" borderRadius={16}/>
      </div>
      <div style={{textAlign: 'center'}}>
        <p style={{margin: '0 0 8px'}}>Solid Color</p>
        <DemoComponent background="#FFDCFF" borderRadius={16} />
      </div>
    </div>
  )
};

export const BorderVariations: Story = {
  render: () => (
    <div style={{display: 'flex', gap: '24px', flexWrap: 'wrap'}}>
      <div style={{textAlign: 'center'}}>
        <p style={{margin: '0 0 8px'}}>No Border</p>
        <DemoComponent borderRadius={16} />
      </div>
      <div style={{textAlign: 'center'}}>
        <p style={{margin: '0 0 8px'}}>Thin Border</p>
        <DemoComponent border="4px solid #8425EC" borderRadius={16} />
      </div>
      <div style={{textAlign: 'center'}}>
        <p style={{margin: '0 0 8px'}}>Medium Border</p>
        <DemoComponent border="8px solid #8425EC" borderRadius={16} />
      </div>
      <div style={{textAlign: 'center'}}>
        <p style={{margin: '0 0 8px'}}>Thick Border</p>
        <DemoComponent border="12px solid #8425EC" borderRadius={16} />
      </div>
    </div>
  )
};

export const BorderRadiusVariations: Story = {
  render: () => (
    <div style={{display: 'flex', gap: '20px', flexWrap: 'wrap'}}>
      <div style={{textAlign: 'center'}}>
        <p style={{margin: '0 0 8px'}}>No Radius</p>
        <DemoComponent border="4px solid #8425EC" />
      </div>
      <div style={{textAlign: 'center'}}>
        <p style={{margin: '0 0 8px'}}>Small Radius</p>
        <DemoComponent border="4px solid #8425EC" borderRadius={8} />
      </div>
      <div style={{textAlign: 'center'}}>
        <p style={{margin: '0 0 8px'}}>Medium Radius</p>
        <DemoComponent border="4px solid #8425EC" borderRadius={16} />
      </div>
      <div style={{textAlign: 'center'}}>
        <p style={{margin: '0 0 8px'}}>Large Radius</p>
        <DemoComponent border="4px solid #8425EC" borderRadius={24} />
      </div>
    </div>
  )
};
