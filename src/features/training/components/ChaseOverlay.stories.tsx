import type { Meta, StoryObj } from '@storybook/react';
import { ChaseOverlay } from './ChaseOverlay';

const meta: Meta<typeof ChaseOverlay> = {
  title: 'Components/ChaseOverlay',
  component: ChaseOverlay,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    // Add your argTypes here
  },
};

export default meta;
type Story = StoryObj<typeof ChaseOverlay>;

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
