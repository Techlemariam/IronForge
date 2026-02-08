import type { Meta, StoryObj } from '@storybook/react';
import { TerritoryStats } from './TerritoryStats';

const meta: Meta<typeof TerritoryStats> = {
  title: 'Components/TerritoryStats',
  component: TerritoryStats,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    // Add your argTypes here
  },
};

export default meta;
type Story = StoryObj<typeof TerritoryStats>;

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
