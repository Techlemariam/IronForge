import type { Meta, StoryObj } from '@storybook/react';
import { RestTimer } from './RestTimer';

const meta: Meta<typeof RestTimer> = {
  title: 'Components/RestTimer',
  component: RestTimer,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    // Add your argTypes here
  },
};

export default meta;
type Story = StoryObj<typeof RestTimer>;

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
