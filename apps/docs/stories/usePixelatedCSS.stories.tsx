/** @jsxImportSource @emotion/react */
import type {Meta, StoryObj} from '@storybook/react';
import {useRef} from 'react';
import {usePixelatedCSS} from '@react-pixel-ui/use-pixelated-css';
import {css} from '@emotion/react';

const DemoComponent = ({
  width = 128,
  height = 48,
  disabled = false,
  background = 'linear-gradient(45deg, #FFDCFF, #FF97FF)',
  border,
  borderRadius,
  unitPixel = 4,
  hoverBackground,
  activeBackground,
  hoverBorder,
  activeBorder,
  disabledBackground,
  disabledBorder,
}: {
  width?: number;
  height?: number;
  disabled?: boolean;
  background?: string;
  border?: string;
  borderRadius?: number;
  unitPixel?: number;
  hoverBackground?: string;
  activeBackground?: string;
  hoverBorder?: string;
  activeBorder?: string;
  disabledBackground?: string;
  disabledBorder?: string;
}) => {
  const ref = useRef<HTMLButtonElement>(null);
  const prevCSS = css`
    width: ${width}px;
    height: ${height}px;
    background: ${background};
    ${border ? `border: ${border};` : ''}
    ${borderRadius ? `border-radius: ${borderRadius}px;` : ''}
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
      background: ${hoverBackground || background};
      ${hoverBorder ? `border: ${hoverBorder};` : border ? `border: ${border};` : ''}
    }

    &:active {
      background: ${activeBackground || background};
      ${activeBorder ? `border: ${activeBorder};` : border ? `border: ${border};` : ''}
    }
    &:disabled {
      background: ${disabledBackground || background};
      ${disabledBorder ? `border: ${disabledBorder};` : border ? `border: ${border};` : ''}
    }
  `;

  const pixelatedCSS = usePixelatedCSS({
    prevCSS,
    ref,
    unitPixel
  });

  return <button ref={ref} css={pixelatedCSS} disabled={disabled} />;
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
    disabled: {
      description: '**[for playground]** Sets the disabled state of the element',
      control: {type: 'boolean'},
      defaultValue: false,
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
    hoverBackground: {
      description: '**[for playground]** Sets the hover background',
      control: 'select',
      options: [
        'none',
        'linear-gradient(45deg, #FFB7FF, #FF6EFF)',
        'linear-gradient(90deg, #FFB7FF, #FF6EFF)',
        'linear-gradient(180deg, #FFB7FF, #FF6EFF)',
        '#FFB7FF',
        '#FF6EFF'
      ],
    },
    activeBackground: {
      description: '**[for playground]** Sets the active background',
      control: 'select',
      options: [
        'none',
        'linear-gradient(45deg, #FF97FF, #FF4FFF)',
        'linear-gradient(90deg, #FF97FF, #FF4FFF)',
        'linear-gradient(180deg, #FF97FF, #FF4FFF)',
        '#FF97FF',
        '#FF4FFF'
      ],
    },
    border: {
      description: '**[for playground]** Sets the border',
      control: 'select',
      options: [
        'none',
        '4px solid #8425EC',
        '8px solid #8425EC',
        '12px solid #8425EC'
      ],
    },
    hoverBorder: {
      description: '**[for playground]** Sets the hover border',
      control: 'select',
      options: [
        'none',
        '4px solid #6B1EBF',
        '8px solid #6B1EBF',
        '12px solid #6B1EBF'
      ],
    },
    activeBorder: {
      description: '**[for playground]** Sets the active border',
      control: 'select',
      options: [
        'none',
        '4px solid #521790',
        '8px solid #521790',
        '12px solid #521790'
      ],
    },
    borderRadius: {
      description: '**[for playground]** Sets the border radius',
      control: {type: 'range', min: 0, max: 32, step: 4},
      defaultValue: 16,
    },
    disabledBackground: {
      description: '**[for playground]** Sets the disabled background',
      control: 'select',
      options: [
        'none',
        '#AAAAAA',
        '#DDDDDD',
        '#FFFFFF'
      ],
    },
    disabledBorder: {
      description: '**[for playground]** Sets the disabled border',
      control: 'select',
      options: [
        'none',
        '4px solid #8425EC',
        '8px solid #8425EC',
        '12px solid #8425EC'
      ],
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
    disabled: false,
    borderRadius: 16,
    border: '4px solid #8425EC',
    background: 'linear-gradient(45deg, #FFDCFF, #FF97FF)',

    hoverBorder: '4px solid #6B1EBF',
    activeBorder: '4px solid #521790',
    hoverBackground: 'linear-gradient(45deg, #FFB7FF, #FF6EFF)',
    activeBackground: 'linear-gradient(45deg, #FF97FF, #FF4FFF)',
    disabledBackground: '#AAAAAA',
    disabledBorder: 'none',
  }
};

// export const UnitPixelComparison: Story = {
//   render: () => (
//     <div style={{display: 'flex', gap: '24px', flexWrap: 'wrap'}}>
//       {[1, 4, 8, 12].map((pixel) => (
//         <div key={pixel} style={{textAlign: 'center'}}>
//           <p style={{margin: '0 0 8px'}}>{pixel}px unit</p>
//           <DemoComponent 
//             unitPixel={pixel}
//             background="linear-gradient(45deg, #FFDCFF, #FF97FF)"
//             border={`${pixel}px solid #8425EC`}
//             borderRadius={16}
//           />
//         </div>
//       ))}
//     </div>
//   )
// };

// export const BackgroundVariations: Story = {
//   render: () => (
//     <div style={{display: 'flex', gap: '24px', flexWrap: 'wrap'}}>
//       <div style={{textAlign: 'center'}}>
//         <p style={{margin: '0 0 8px'}}>45° Gradient</p>
//         <DemoComponent background="linear-gradient(45deg, #FFDCFF, #FF97FF)" borderRadius={16}/>
//       </div>
//       <div style={{textAlign: 'center'}}>
//         <p style={{margin: '0 0 8px'}}>90° Gradient</p>
//         <DemoComponent background="linear-gradient(90deg, #FFEEFF, #FF97FF)" borderRadius={16}/>
//       </div>
//       <div style={{textAlign: 'center'}}>
//         <p style={{margin: '0 0 8px'}}>180° Gradient</p>
//         <DemoComponent background="linear-gradient(180deg, #FFEEFF, #FF97FF)" borderRadius={16}/>
//       </div>
//       <div style={{textAlign: 'center'}}>
//         <p style={{margin: '0 0 8px'}}>Solid Color</p>
//         <DemoComponent background="#FFDCFF" borderRadius={16} />
//       </div>
//     </div>
//   )
// };

// export const BorderVariations: Story = {
//   render: () => (
//     <div style={{display: 'flex', gap: '24px', flexWrap: 'wrap'}}>
//       <div style={{textAlign: 'center'}}>
//         <p style={{margin: '0 0 8px'}}>No Border</p>
//         <DemoComponent borderRadius={16} />
//       </div>
//       <div style={{textAlign: 'center'}}>
//         <p style={{margin: '0 0 8px'}}>Thin Border</p>
//         <DemoComponent border="4px solid #8425EC" borderRadius={16} />
//       </div>
//       <div style={{textAlign: 'center'}}>
//         <p style={{margin: '0 0 8px'}}>Medium Border</p>
//         <DemoComponent border="8px solid #8425EC" borderRadius={16} />
//       </div>
//       <div style={{textAlign: 'center'}}>
//         <p style={{margin: '0 0 8px'}}>Thick Border</p>
//         <DemoComponent border="12px solid #8425EC" borderRadius={16} />
//       </div>
//     </div>
//   )
// };

// export const BorderRadiusVariations: Story = {
//   render: () => (
//     <div style={{display: 'flex', gap: '20px', flexWrap: 'wrap'}}>
//       <div style={{textAlign: 'center'}}>
//         <p style={{margin: '0 0 8px'}}>No Radius</p>
//         <DemoComponent border="4px solid #8425EC" />
//       </div>
//       <div style={{textAlign: 'center'}}>
//         <p style={{margin: '0 0 8px'}}>Small Radius</p>
//         <DemoComponent border="4px solid #8425EC" borderRadius={8} />
//       </div>
//       <div style={{textAlign: 'center'}}>
//         <p style={{margin: '0 0 8px'}}>Medium Radius</p>
//         <DemoComponent border="4px solid #8425EC" borderRadius={16} />
//       </div>
//       <div style={{textAlign: 'center'}}>
//         <p style={{margin: '0 0 8px'}}>Large Radius</p>
//         <DemoComponent border="4px solid #8425EC" borderRadius={24} />
//       </div>
//     </div>
//   )
// };

// export const InteractionStates: Story = {
//   render: () => (
//     <div style={{display: 'flex', gap: '24px', flexWrap: 'wrap'}}>
//       <div style={{textAlign: 'center'}}>
//         <p style={{margin: '0 0 8px'}}>Hover & Active States</p>
//         <DemoComponent 
//           background="linear-gradient(45deg, #FFDCFF, #FF97FF)"
//           hoverBackground="linear-gradient(45deg, #FFB7FF, #FF6EFF)"
//           activeBackground="linear-gradient(45deg, #FF97FF, #FF4FFF)"
//           border="4px solid #8425EC"
//           hoverBorder="4px solid #6B1EBF"
//           activeBorder="4px solid #521790"
//           borderRadius={16}
//         />
//       </div>
//       <div style={{textAlign: 'center'}}>
//         <p style={{margin: '0 0 8px'}}>Background Change Only</p>
//         <DemoComponent 
//           background="#FFDCFF"
//           hoverBackground="#FFB7FF"
//           activeBackground="#FF97FF"
//           borderRadius={16}
//         />
//       </div>
//       <div style={{textAlign: 'center'}}>
//         <p style={{margin: '0 0 8px'}}>Border Change Only</p>
//         <DemoComponent 
//           border="4px solid #8425EC"
//           hoverBorder="4px solid #6B1EBF"
//           activeBorder="4px solid #521790"
//           borderRadius={16}
//         />
//       </div>
//     </div>
//   )
// };
