import type { Meta, StoryObj } from '@storybook/react';
import { input } from './input';

const meta: Meta<typeof input> = {
  title: 'Components/input',
  component: input,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    // Add your argTypes here
  },
};

export default meta;
type Story = StoryObj<typeof input>;

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
