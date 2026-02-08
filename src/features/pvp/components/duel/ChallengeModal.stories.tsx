import type { Meta, StoryObj } from '@storybook/react';
import { ChallengeModal } from './ChallengeModal';

const meta: Meta<typeof ChallengeModal> = {
  title: 'Components/ChallengeModal',
  component: ChallengeModal,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    // Add your argTypes here
  },
};

export default meta;
type Story = StoryObj<typeof ChallengeModal>;

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
