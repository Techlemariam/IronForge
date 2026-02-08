import type { Meta, StoryObj } from '@storybook/react';
import { TerritoryLeaderboard } from './TerritoryLeaderboard';

const meta: Meta<typeof TerritoryLeaderboard> = {
  title: 'Components/TerritoryLeaderboard',
  component: TerritoryLeaderboard,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    // Add your argTypes here
  },
};

export default meta;
type Story = StoryObj<typeof TerritoryLeaderboard>;

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
