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
  title: 'Hooks/usePixelatedCSS',
  component: DemoComponent,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
usePixelatedCSS 훅은 CSS 스타일을 픽셀화된 형태로 변환하는 기능을 제공합니다.

### 주요 기능
- **prevCSS**: 픽셀화하고자 하는 원본 CSS (SerializedStyles)
- **ref**: 픽셀화할 요소에 대한 참조 (React.RefObject<HTMLElement>)
- **unitPixel**: 픽셀화 단위 크기 (기본값: 4)
`,
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    width: {
      description: '요소의 너비를 설정합니다.',
      control: {type: 'number'},
      defaultValue: 128,
    },
    height: {
      description: '요소의 높이를 설정합니다.',
      control: {type: 'number'},
      defaultValue: 48,
    },
    background: {
      description: '배경을 설정합니다.',
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
      description: '테두리를 설정합니다.',
      control: 'select',
      options: [
        undefined,
        '4px solid #8425EC',
        '8px solid #8425EC',
        '12px solid #8425EC'
      ],
    },
    borderRadius: {
      description: '테두리 반경을 설정합니다.',
      control: {type: 'range', min: 0, max: 32, step: 4},
      defaultValue: 16,
    },
    unitPixel: {
      description: '픽셀화 단위 크기를 결정합니다.',
      control: {type: 'range', min: 4, max: 20, step: 2},
      defaultValue: 4,
    },
  },
} satisfies Meta<typeof DemoComponent>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  args: {
    width: 128,
    height: 48,
    background: 'linear-gradient(45deg, #FFDCFF, #FF97FF)',
    border: '4px solid #8425EC',
    borderRadius: 16,
    unitPixel: 4
  }
};

export const UnitPixelComparison: Story = {
  render: () => (
    <div style={{display: 'flex', gap: '24px', flexWrap: 'wrap'}}>
      {[1, 4, 8, 12].map((pixel) => (
        <div key={pixel} style={{textAlign: 'center'}}>
          <p style={{margin: '0 0 8px'}}>{pixel}px 단위</p>
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
        <p style={{margin: '0 0 8px'}}>45도 그라데이션</p>
        <DemoComponent background="linear-gradient(45deg, #FFDCFF, #FF97FF)" />
      </div>
      <div style={{textAlign: 'center'}}>
        <p style={{margin: '0 0 8px'}}>90도 그라데이션</p>
        <DemoComponent background="linear-gradient(90deg, #FFEEFF, #FF97FF)" />
      </div>
      <div style={{textAlign: 'center'}}>
        <p style={{margin: '0 0 8px'}}>180도 그라데이션</p>
        <DemoComponent background="linear-gradient(180deg, #FFEEFF, #FF97FF)" />
      </div>
      <div style={{textAlign: 'center'}}>
        <p style={{margin: '0 0 8px'}}>단색</p>
        <DemoComponent background="#FFDCFF" borderRadius={16} />
      </div>
    </div>
  )
};

export const BorderVariations: Story = {
  render: () => (
    <div style={{display: 'flex', gap: '24px', flexWrap: 'wrap'}}>
      <div style={{textAlign: 'center'}}>
        <p style={{margin: '0 0 8px'}}>테두리 없음</p>
        <DemoComponent borderRadius={16} />
      </div>
      <div style={{textAlign: 'center'}}>
        <p style={{margin: '0 0 8px'}}>얇은 테두리</p>
        <DemoComponent border="4px solid #8425EC" borderRadius={16} />
      </div>
      <div style={{textAlign: 'center'}}>
        <p style={{margin: '0 0 8px'}}>중간 테두리</p>
        <DemoComponent border="8px solid #8425EC" borderRadius={16} />
      </div>
      <div style={{textAlign: 'center'}}>
        <p style={{margin: '0 0 8px'}}>두꺼운 테두리</p>
        <DemoComponent border="12px solid #8425EC" borderRadius={16} />
      </div>
    </div>
  )
};

export const BorderRadiusVariations: Story = {
  render: () => (
    <div style={{display: 'flex', gap: '20px', flexWrap: 'wrap'}}>
      <div style={{textAlign: 'center'}}>
        <p style={{margin: '0 0 8px'}}>반경 없음</p>
        <DemoComponent border="4px solid #8425EC" />
      </div>
      <div style={{textAlign: 'center'}}>
        <p style={{margin: '0 0 8px'}}>작은 반경</p>
        <DemoComponent border="4px solid #8425EC" borderRadius={8} />
      </div>
      <div style={{textAlign: 'center'}}>
        <p style={{margin: '0 0 8px'}}>중간 반경</p>
        <DemoComponent border="4px solid #8425EC" borderRadius={16} />
      </div>
      <div style={{textAlign: 'center'}}>
        <p style={{margin: '0 0 8px'}}>큰 반경</p>
        <DemoComponent border="4px solid #8425EC" borderRadius={24} />
      </div>
    </div>
  )
};
