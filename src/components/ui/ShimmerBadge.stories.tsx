import type { Meta, StoryObj } from '@storybook/react';
import { ShimmerBadge } from './ShimmerBadge';

const meta: Meta<typeof ShimmerBadge> = {
  title: 'Components/ShimmerBadge',
  component: ShimmerBadge,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    // Add your argTypes here
  },
};

export default meta;
type Story = StoryObj<typeof ShimmerBadge>;

export const Default: Story = {
  args: {
    // Add default props here
  },
};

export const Variant: Story = {
  args: {
    // Add variant props here
  },
};
