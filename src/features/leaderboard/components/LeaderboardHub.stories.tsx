import type { Meta, StoryObj } from '@storybook/react';
import { LeaderboardHub } from './LeaderboardHub';

const meta: Meta<typeof LeaderboardHub> = {
  title: 'Components/LeaderboardHub',
  component: LeaderboardHub,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    // Add your argTypes here
  },
};

export default meta;
type Story = StoryObj<typeof LeaderboardHub>;

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
