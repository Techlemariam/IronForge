import type { Meta, StoryObj } from '@storybook/react';
import { GameToaster } from './GameToast';

const meta: Meta<typeof GameToaster> = {
  title: 'Components/GameToast',
  component: GameToaster,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    // Add your argTypes here
  },
};

export default meta;
type Story = StoryObj<typeof GameToaster>;

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
