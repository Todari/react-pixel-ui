import type {Meta, StoryObj} from '@storybook/react';

import {Button} from '@react-pixel-ui/pixel-ui';

const meta = {
  title: 'pixel-ui/button',
  component: Button,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
The Button component is a fundamental interaction element that prompts user actions.

### Props
- **variant (optional default: primary)**: Determines the button style (primary, secondary, tertiary)
- **size (optional default: md)**: Sets the button size (sm, md, lg)
- **bg (optional)**: Defines the button color (hex code)
- **hasGradient (optional default: true)**: Toggles gradient effect
- **hasBorder (optional default: true)**: Toggles border visibility

### Usage
\`\`\`jsx
// Basic usage
<Button variant="primary" size="md">
  Basic Button
</Button>

// Custom color
<Button variant="primary" bg="#46e3ff">
  Custom Color Button
</Button>

// Without gradient
<Button variant="primary" hasGradient={false}>
  Solid Color Button
</Button>

// Without border
<Button variant="primary" hasBorder={false}>
  Borderless Button
</Button>

// Secondary button
<Button variant="secondary">
  Secondary Button
</Button>

// Custom pixelation
<Button variant="primary" unitPixel={8}>
  Custom Pixelation Button
</Button>
\`\`\`
`,
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      description: '**[Props]** (optional default: primary) Determines the button style',
      control: {type: 'select'},
      options: ['primary', 'secondary', 'tertiary'],
      defaultValue: 'primary',
    },
    size: {
      description: '**[Props]** (optional default: md) Sets the button size',
      control: {type: 'select'},
      options: ['sm', 'md', 'lg'],
      defaultValue: 'md',
    },
    bg: {
      description: '**[Props]** (optional default: #FF14FF) Defines the button color (hex code)',
      control: 'color',
      defaultValue: '#f14bff',
    },
    hasGradient: {
      description: '**[Props]** (optional default: true) Toggles gradient effect',
      control: 'boolean',
      defaultValue: true,
    },
    hasBorder: {
      description: '**[Props]** (optional default: true) Toggles border visibility',
      control: 'boolean', 
      defaultValue: true,
      },
  },
  args: {
    variant: 'primary',
    size: 'md',
    bg: '#f14bff',
    hasGradient: true,
    hasBorder: true,
    children: "button"
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    variant: 'primary',
    children: 'Primary Button',
  },
};

export const Secondary: Story = {
  args: {
    variant: 'secondary',
    children: 'Secondary Button',
  },
};

export const Tertiary: Story = {
  args: {
    variant: 'tertiary',
    children: 'Tertiary Button',
  },
};

export const CustomColor: Story = {
  args: {
    variant: 'primary',
    bg: '#46e3ff',
    children: 'Custom Color Button',
  },
};

export const NoGradient: Story = {
  args: {
    variant: 'primary',
    hasGradient: false,
    children: 'Solid Color Button',
  },
};

export const NoBorder: Story = {
  args: {
    variant: 'primary',
    hasBorder: false,
    children: 'Borderless Button',
  },
};

export const Small: Story = {
  args: {
    variant: 'primary',
    size: 'sm',
    children: 'Small Button',
  },
};

export const Large: Story = {
  args: {
    variant: 'primary',
    size: 'lg',
    children: 'Large Button',
  },
};