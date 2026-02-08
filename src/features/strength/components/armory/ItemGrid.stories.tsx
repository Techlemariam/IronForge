import type { Meta, StoryObj } from '@storybook/react';
import { ItemGrid } from './ItemGrid';

const meta: Meta<typeof ItemGrid> = {
  title: 'Components/ItemGrid',
  component: ItemGrid,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    // Add your argTypes here
  },
};

export default meta;
type Story = StoryObj<typeof ItemGrid>;

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
