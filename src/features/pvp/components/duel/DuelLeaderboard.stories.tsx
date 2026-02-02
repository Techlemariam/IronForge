import type { Meta, StoryObj } from '@storybook/react';
import { DuelLeaderboard } from './DuelLeaderboard';

const meta: Meta<typeof DuelLeaderboard> = {
  title: 'Components/DuelLeaderboard',
  component: DuelLeaderboard,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    // Add your argTypes here
  },
};

export default meta;
type Story = StoryObj<typeof DuelLeaderboard>;

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
