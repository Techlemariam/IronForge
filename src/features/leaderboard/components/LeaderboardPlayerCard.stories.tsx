import type { Meta, StoryObj } from '@storybook/react';
import { LeaderboardPlayerCard } from './LeaderboardPlayerCard';

const meta: Meta<typeof LeaderboardPlayerCard> = {
  title: 'Components/LeaderboardPlayerCard',
  component: LeaderboardPlayerCard,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    // Add your argTypes here
  },
};

export default meta;
type Story = StoryObj<typeof LeaderboardPlayerCard>;

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
