import type { Meta, StoryObj } from '@storybook/react';
import { StrengthLeaderboardPanel } from './StrengthLeaderboardPanel';

const meta: Meta<typeof StrengthLeaderboardPanel> = {
  title: 'Components/StrengthLeaderboardPanel',
  component: StrengthLeaderboardPanel,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    // Add your argTypes here
  },
};

export default meta;
type Story = StoryObj<typeof StrengthLeaderboardPanel>;

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
