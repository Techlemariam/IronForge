import type { Meta, StoryObj } from '@storybook/react';
import { GameToast } from './GameToast';

const meta: Meta<typeof GameToast> = {
  title: 'Components/GameToast',
  component: GameToast,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    // Add your argTypes here
  },
};

export default meta;
type Story = StoryObj<typeof GameToast>;

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
