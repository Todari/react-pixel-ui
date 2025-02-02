import type {Meta, StoryObj} from '@storybook/react';

import {Text} from '@react-pixel-ui/pixel-ui';

const meta = {
  title: 'pixel-ui/text',
  component: Text,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
Text 컴포넌트는 텍스트를 표시하는 기본적인 타이포그래피 요소입니다.

### 주요 기능
- **size**: 텍스트의 크기를 결정합니다 (heading, title, subtitle, body, caption, label, tiny)

### 사용 예시
\`\`\`jsx
// 제목 텍스트
<Text size="heading">
  제목 텍스트
</Text>

// 본문 텍스트
<Text size="body">
  본문 텍스트
</Text>

// 캡션 텍스트
<Text size="caption">
  캡션 텍스트
</Text>
\`\`\`
`,
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    size: {
      description: '텍스트의 크기를 결정합니다.',
      control: {type: 'select'},
      options: ['heading', 'title', 'subtitle', 'body', 'caption', 'label', 'tiny'],
      defaultValue: 'body',
    },
    children: {
      description: '표시될 텍스트 내용입니다.',
      control: 'text',
    },
  },
  args: {
    size: 'body',
    children: '텍스트',
  },
} satisfies Meta<typeof Text>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Heading: Story = {
  args: {
    size: 'heading',
    children: '제목 텍스트',
  },
};

export const Title: Story = {
  args: {
    size: 'title',
    children: '타이틀 텍스트',
  },
};

export const Subtitle: Story = {
  args: {
    size: 'subtitle',
    children: '서브타이틀 텍스트',
  },
};

export const Body: Story = {
  args: {
    size: 'body',
    children: '본문 텍스트입니다. 기본적인 텍스트 스타일을 보여줍니다.',
  },
};

export const Caption: Story = {
  args: {
    size: 'caption',
    children: '캡션 텍스트',
  },
};

export const Label: Story = {
  args: {
    size: 'label',
    children: '라벨 텍스트',
  },
};

export const Tiny: Story = {
  args: {
    size: 'tiny',
    children: '작은 텍스트',
  },
};
