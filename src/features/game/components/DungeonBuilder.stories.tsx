import type { Meta, StoryObj } from '@storybook/react';
import { DungeonBuilder } from './DungeonBuilder';

const meta: Meta<typeof DungeonBuilder> = {
  title: 'Components/DungeonBuilder',
  component: DungeonBuilder,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    // Add your argTypes here
  },
};

export default meta;
type Story = StoryObj<typeof DungeonBuilder>;

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
