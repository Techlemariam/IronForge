import type { Meta, StoryObj } from '@storybook/react';
import { TrophyRoom } from './TrophyRoom';

const meta: Meta<typeof TrophyRoom> = {
  title: 'Components/TrophyRoom',
  component: TrophyRoom,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    // Add your argTypes here
  },
};

export default meta;
type Story = StoryObj<typeof TrophyRoom>;

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
