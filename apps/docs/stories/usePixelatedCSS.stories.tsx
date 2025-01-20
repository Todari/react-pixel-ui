/** @jsxImportSource @emotion/react */
import type {Meta, StoryObj} from '@storybook/react';
import {useRef} from 'react';
import {usePixelatedCSS} from '@react-pixel-ui/use-pixelated-css';
import {css} from '@emotion/react';

const DemoComponent = ({unitPixel}: {unitPixel?: number}) => {
  const ref = useRef<HTMLDivElement>(null);
  const prevCSS = css`
    width: 200px;
    height: 100px;
    background: linear-gradient(45deg, #FFDCFF, #FF97FF);
    border: 2px solid #8425EC;
    border-radius: 12px;
    padding: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
  `;

  const {pixelatedCSS} = usePixelatedCSS({
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

### 사용 예시
\`\`\`jsx
const MyComponent = () => {
  const ref = useRef<HTMLDivElement>(null);
  const prevCSS = css\`
    width: 200px;
    height: 100px;
    background: linear-gradient(45deg, #FFDCFF, #FF97FF);
    border: 2px solid #8425EC;
    border-radius: 12px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    padding: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
  \`;

  const {pixelatedCSS} = usePixelatedCSS({
    prevCSS,
    ref,
    unitPixel: 4
  });

  return <div ref={ref} css={pixelatedCSS} />;
};
\`\`\`

### 지원되는 CSS 속성들
- 배경 색상 및 그라데이션
- 테두리 스타일 및 두께
- 테두리 반경(border-radius)
- 패딩과 마진
- Flexbox 레이아웃 속성
- 위치 지정(position) 속성
- 투명도(opacity)
`,
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    unitPixel: {
      description: '픽셀화 단위 크기를 결정합니다.',
      control: {type: 'number'},
      defaultValue: 4,
    },
  },
  args: {
    unitPixel: 4,
  },
} satisfies Meta<typeof DemoComponent>;

export default meta;
type Story = StoryObj<typeof meta>;

export const DiagonalGradient: Story = {
  render: () => {
    const ref = useRef<HTMLDivElement>(null);
    const prevCSS = css`
      width: 200px;
      height: 100px;
      background: linear-gradient(45deg, #FFDCFF, #FF97FF);
    `;
    const {pixelatedCSS} = usePixelatedCSS({prevCSS, ref});
    return <div ref={ref} css={pixelatedCSS} />;
  }
};

export const VerticalGradientWithBorder: Story = {
  render: () => {
    const ref = useRef<HTMLDivElement>(null);
    const prevCSS = css`
      width: 200px;
      height: 100px;
      background: linear-gradient(180deg, #FFDCFF, #FF97FF);
      border: 4px solid #8425EC;
      border-radius: 24px;
    `;
    const {pixelatedCSS} = usePixelatedCSS({prevCSS, ref});
    return <div ref={ref} css={pixelatedCSS} />;
  }
};

export const HorizontalGradientWithRadius: Story = {
  render: () => {
    const ref = useRef<HTMLDivElement>(null);
    const prevCSS = css`
      width: 200px;
      height: 100px;
      background: linear-gradient(90deg, #FFDCFF, #FF97FF);
      border-radius: 24px;
    `;
    const {pixelatedCSS} = usePixelatedCSS({prevCSS, ref});
    return <div ref={ref} css={pixelatedCSS} />;
  }
};
