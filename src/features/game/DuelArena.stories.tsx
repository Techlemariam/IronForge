import type { Meta, StoryObj } from '@storybook/react';
import { DuelArena } from './DuelArena';

const meta: Meta<typeof DuelArena> = {
  title: 'Components/DuelArena',
  component: DuelArena,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    // Add your argTypes here
  },
};

export default meta;
type Story = StoryObj<typeof DuelArena>;

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
