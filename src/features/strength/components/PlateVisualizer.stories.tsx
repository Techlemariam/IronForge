import type { Meta, StoryObj } from '@storybook/react';
import { PlateVisualizer } from './PlateVisualizer';

const meta: Meta<typeof PlateVisualizer> = {
  title: 'Components/PlateVisualizer',
  component: PlateVisualizer,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    // Add your argTypes here
  },
};

export default meta;
type Story = StoryObj<typeof PlateVisualizer>;

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
