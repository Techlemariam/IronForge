import type { Meta, StoryObj } from '@storybook/react';
import { PushSubscriptionToggle } from './PushSubscriptionToggle';

const meta: Meta<typeof PushSubscriptionToggle> = {
  title: 'Components/PushSubscriptionToggle',
  component: PushSubscriptionToggle,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    // Add your argTypes here
  },
};

export default meta;
type Story = StoryObj<typeof PushSubscriptionToggle>;

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
