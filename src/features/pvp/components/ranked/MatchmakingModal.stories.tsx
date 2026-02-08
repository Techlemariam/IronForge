import type { Meta, StoryObj } from '@storybook/react';
import { MatchmakingModal } from './MatchmakingModal';

const meta: Meta<typeof MatchmakingModal> = {
  title: 'Components/MatchmakingModal',
  component: MatchmakingModal,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    // Add your argTypes here
  },
};

export default meta;
type Story = StoryObj<typeof MatchmakingModal>;

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
