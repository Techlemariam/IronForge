import type { Meta, StoryObj } from '@storybook/react';
import { scroll-area } from './scroll-area';

const meta: Meta<typeof scroll-area> = {
  title: 'Components/scroll-area',
  component: scroll-area,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    // Add your argTypes here
  },
};

export default meta;
type Story = StoryObj<typeof scroll-area>;

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
