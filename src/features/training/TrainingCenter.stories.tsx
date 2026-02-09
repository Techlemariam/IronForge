import type { Meta, StoryObj } from '@storybook/react';
import TrainingCenter from './TrainingCenter';

const meta: Meta<typeof TrainingCenter> = {
  title: 'Components/TrainingCenter',
  component: TrainingCenter,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    // Add your argTypes here
  },
};

export default meta;
type Story = StoryObj<typeof TrainingCenter>;

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
