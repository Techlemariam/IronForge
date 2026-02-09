import type { Meta, StoryObj } from '@storybook/react';
import ExerciseView from './ExerciseView';

const meta: Meta<typeof ExerciseView> = {
  title: 'Components/ExerciseView',
  component: ExerciseView,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    // Add your argTypes here
  },
};

export default meta;
type Story = StoryObj<typeof ExerciseView>;

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
