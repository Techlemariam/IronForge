import type { Meta, StoryObj } from '@storybook/react';
import { BerserkerMode } from './BerserkerMode';

const meta: Meta<typeof BerserkerMode> = {
  title: 'Components/BerserkerMode',
  component: BerserkerMode,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    // Add your argTypes here
  },
};

export default meta;
type Story = StoryObj<typeof BerserkerMode>;

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
