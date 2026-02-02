import type { Meta, StoryObj } from '@storybook/react';
import { card } from './card';

const meta: Meta<typeof card> = {
  title: 'Components/card',
  component: card,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    // Add your argTypes here
  },
};

export default meta;
type Story = StoryObj<typeof card>;

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
