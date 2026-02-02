import type { Meta, StoryObj } from '@storybook/react';
import { CombatArena } from './CombatArena';

const meta: Meta<typeof CombatArena> = {
  title: 'Components/CombatArena',
  component: CombatArena,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    // Add your argTypes here
  },
};

export default meta;
type Story = StoryObj<typeof CombatArena>;

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
