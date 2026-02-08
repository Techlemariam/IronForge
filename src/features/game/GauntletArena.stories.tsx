import type { Meta, StoryObj } from '@storybook/react';
import { GauntletArena } from './GauntletArena';

const meta: Meta<typeof GauntletArena> = {
  title: 'Components/GauntletArena',
  component: GauntletArena,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    // Add your argTypes here
  },
};

export default meta;
type Story = StoryObj<typeof GauntletArena>;

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
