import type { Meta, StoryObj } from '@storybook/react';
import { progress } from './progress';

const meta: Meta<typeof progress> = {
  title: 'Components/progress',
  component: progress,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    // Add your argTypes here
  },
};

export default meta;
type Story = StoryObj<typeof progress>;

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
