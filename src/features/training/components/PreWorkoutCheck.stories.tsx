import type { Meta, StoryObj } from '@storybook/react';
import { PreWorkoutCheck } from './PreWorkoutCheck';

const meta: Meta<typeof PreWorkoutCheck> = {
  title: 'Components/PreWorkoutCheck',
  component: PreWorkoutCheck,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    // Add your argTypes here
  },
};

export default meta;
type Story = StoryObj<typeof PreWorkoutCheck>;

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
