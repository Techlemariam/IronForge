import type { Meta, StoryObj } from '@storybook/react';
import RoutineSelector from './RoutineSelector';

const meta: Meta<typeof RoutineSelector> = {
  title: 'Components/RoutineSelector',
  component: RoutineSelector,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    // Add your argTypes here
  },
};

export default meta;
type Story = StoryObj<typeof RoutineSelector>;

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
