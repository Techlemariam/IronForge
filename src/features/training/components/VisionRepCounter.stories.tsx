import type { Meta, StoryObj } from '@storybook/react';
import VisionRepCounter from './VisionRepCounter';

const meta: Meta<typeof VisionRepCounter> = {
  title: 'Components/VisionRepCounter',
  component: VisionRepCounter,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    // Add your argTypes here
  },
};

export default meta;
type Story = StoryObj<typeof VisionRepCounter>;

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
