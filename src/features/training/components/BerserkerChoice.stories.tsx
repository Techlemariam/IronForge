import type { Meta, StoryObj } from '@storybook/react';
import { BerserkerChoice } from './BerserkerChoice';

const meta: Meta<typeof BerserkerChoice> = {
  title: 'Components/BerserkerChoice',
  component: BerserkerChoice,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    // Add your argTypes here
  },
};

export default meta;
type Story = StoryObj<typeof BerserkerChoice>;

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
