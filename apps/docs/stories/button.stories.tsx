import type {Meta, StoryObj} from '@storybook/react';

import {Button} from '@react-pixel-ui/pixel-ui';

const meta = {
  title: 'Components/button',
  component: Button,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
Button 컴포넌트는 사용자의 액션을 유도하는 기본적인 인터랙션 요소입니다.

### 주요 기능
- **variant**: 버튼의 스타일을 결정합니다 (primary, secondary, tertiary)
- **size**: 버튼의 크기를 결정합니다 (sm, md, lg)
- **bg**: 버튼의 색상을 결정합니다 (hex 코드)
- **useGradient**: 그라데이션 효과 사용 여부를 결정합니다
- **useBorder**: 테두리 사용 여부를 결정합니다

### 사용 예시
\`\`\`jsx
// 기본 사용
<Button variant="primary" size="md">
  기본 버튼
</Button>

// 커스텀 색상
<Button variant="primary" bg="#46e3ff">
  커스텀 색상 버튼
</Button>

// 그라데이션 없는 버튼
<Button variant="primary" useGradient={false}>
  단색 버튼
</Button>

// 테두리 없는 버튼
<Button variant="primary" useBorder={false}>
  테두리 없는 버튼
</Button>

// 세컨더리 버튼
<Button variant="secondary">
  세컨더리 버튼
</Button>
\`\`\`
`,
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      description: '버튼의 스타일을 결정합니다.',
      control: {type: 'select'},
      options: ['primary', 'secondary', 'tertiary'],
      defaultValue: 'primary',
    },
    size: {
      description: '버튼의 크기를 결정합니다.',
      control: {type: 'select'},
      options: ['sm', 'md', 'lg'],
      defaultValue: 'md',
    },
    bg: {
      description: '버튼의 색상을 결정합니다 (hex 코드)',
      control: 'color',
      defaultValue: '#f14bff',
    },
    hasGradient: {
      description: '그라데이션 효과 사용 여부를 결정합니다.',
      control: 'boolean',
      defaultValue: true,
    },
    hasBorder: {
      description: '테두리 사용 여부를 결정합니다.',
      control: 'boolean', 
      defaultValue: true,
    },
    children: {
      description: '버튼 내부에 표시될 텍스트 또는 요소입니다.',
      control: 'text',
    },
  },
  args: {
    variant: 'primary',
    size: 'md',
    bg: '#f14bff',
    hasGradient: true,
    hasBorder: true,
    children: '버튼',
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    variant: 'primary',
    children: '기본 버튼',
  },
};

export const Secondary: Story = {
  args: {
    variant: 'secondary',
    children: '보조 버튼',
  },
};

export const Tertiary: Story = {
  args: {
    variant: 'tertiary',
    children: '세 번째 버튼',
  },
};

export const CustomColor: Story = {
  args: {
    variant: 'primary',
    bg: '#46e3ff',
    children: '커스텀 색상 버튼',
  },
};

export const NoGradient: Story = {
  args: {
    variant: 'primary',
    hasGradient: false,
    children: '단색 버튼',
  },
};

export const NoBorder: Story = {
  args: {
    variant: 'primary',
    hasBorder: false,
    children: '테두리 없는 버튼',
  },
};

export const Small: Story = {
  args: {
    variant: 'primary',
    size: 'sm',
    children: '작은 버튼',
  },
};

export const Large: Story = {
  args: {
    variant: 'primary',
    size: 'lg',
    children: '큰 버튼',
  },
};
