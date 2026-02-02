import type { Meta, StoryObj } from '@storybook/react';
import { ExerciseSearch } from './ExerciseSearch';

const meta: Meta<typeof ExerciseSearch> = {
  title: 'Components/ExerciseSearch',
  component: ExerciseSearch,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    // Add your argTypes here
  },
};

export default meta;
type Story = StoryObj<typeof ExerciseSearch>;

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
