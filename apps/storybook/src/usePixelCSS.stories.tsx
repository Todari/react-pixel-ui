import type { Meta, StoryObj } from '@storybook/react';
import { usePixelCSS, PixelCSSProvider } from '@react-pixel-ui/react';

const meta: Meta<typeof PixelCSSProvider> = {
  title: 'Hooks/usePixelCSS',
  component: PixelCSSProvider,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

function PixelatedBox({ css, unitPixel = 4, smooth = false }: {
  css: string;
  unitPixel?: number;
  smooth?: boolean;
}) {
  const pixelCSS = usePixelCSS(css, { unitPixel, smooth });
  
  return (
    <div style={pixelCSS}>
      Pixelated Content
    </div>
  );
}

export const Basic: Story = {
  render: () => (
    <PixelCSSProvider>
      <PixelatedBox 
        css={`
          background: linear-gradient(45deg, #ff0000, #00ff00);
          border: 2px solid #000;
          border-radius: 8px;
          padding: 20px;
          color: white;
          font-size: 16px;
          width: 200px;
          height: 100px;
        `}
      />
    </PixelCSSProvider>
  ),
};

export const WithGradient: Story = {
  render: () => (
    <PixelCSSProvider>
      <PixelatedBox 
        css={`
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border: 3px solid #333;
          border-radius: 12px;
          padding: 30px;
          color: white;
          font-size: 18px;
          font-weight: bold;
          width: 250px;
          height: 120px;
        `}
        unitPixel={6}
      />
    </PixelCSSProvider>
  ),
};

export const SmoothRendering: Story = {
  render: () => (
    <PixelCSSProvider>
      <PixelatedBox 
        css={`
          background: radial-gradient(circle, #ff6b6b, #4ecdc4);
          border: 1px solid #666;
          border-radius: 20px;
          padding: 25px;
          color: white;
          font-size: 14px;
          width: 180px;
          height: 90px;
        `}
        unitPixel={3}
        smooth={true}
      />
    </PixelCSSProvider>
  ),
}; 