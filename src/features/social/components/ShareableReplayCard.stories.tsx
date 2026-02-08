import type { Meta, StoryObj } from '@storybook/react';
import { ShareableReplayCard } from './ShareableReplayCard';

const meta: Meta<typeof ShareableReplayCard> = {
  title: 'Components/ShareableReplayCard',
  component: ShareableReplayCard,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    // Add your argTypes here
  },
};

export default meta;
type Story = StoryObj<typeof ShareableReplayCard>;

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
