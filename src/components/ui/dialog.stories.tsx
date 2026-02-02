import type { Meta, StoryObj } from '@storybook/react';
import { dialog } from './dialog';

const meta: Meta<typeof dialog> = {
  title: 'Components/dialog',
  component: dialog,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    // Add your argTypes here
  },
};

export default meta;
type Story = StoryObj<typeof dialog>;

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
