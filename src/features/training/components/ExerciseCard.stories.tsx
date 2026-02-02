import type { Meta, StoryObj } from '@storybook/react';
import { ExerciseCard } from './ExerciseCard';

const meta: Meta<typeof ExerciseCard> = {
  title: 'Components/ExerciseCard',
  component: ExerciseCard,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    // Add your argTypes here
  },
};

export default meta;
type Story = StoryObj<typeof ExerciseCard>;

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
