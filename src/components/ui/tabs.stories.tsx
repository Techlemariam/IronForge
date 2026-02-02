import type { Meta, StoryObj } from '@storybook/react';
import { tabs } from './tabs';

const meta: Meta<typeof tabs> = {
  title: 'Components/tabs',
  component: tabs,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    // Add your argTypes here
  },
};

export default meta;
type Story = StoryObj<typeof tabs>;

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
