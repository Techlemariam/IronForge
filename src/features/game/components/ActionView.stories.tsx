import type { Meta, StoryObj } from '@storybook/react';
import { ActionView } from './ActionView';

const meta: Meta<typeof ActionView> = {
  title: 'Components/ActionView',
  component: ActionView,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    // Add your argTypes here
  },
};

export default meta;
type Story = StoryObj<typeof ActionView>;

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
