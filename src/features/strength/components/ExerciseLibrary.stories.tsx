import type { Meta, StoryObj } from '@storybook/react';
import ExerciseLibrary from './ExerciseLibrary';

const meta: Meta<typeof ExerciseLibrary> = {
  title: 'Components/ExerciseLibrary',
  component: ExerciseLibrary,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    // Add your argTypes here
  },
};

export default meta;
type Story = StoryObj<typeof ExerciseLibrary>;

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
