import type { Meta, StoryObj } from '@storybook/react';
import { TransitionView } from './TransitionView';

const meta: Meta<typeof TransitionView> = {
  title: 'Components/TransitionView',
  component: TransitionView,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    // Add your argTypes here
  },
};

export default meta;
type Story = StoryObj<typeof TransitionView>;

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
