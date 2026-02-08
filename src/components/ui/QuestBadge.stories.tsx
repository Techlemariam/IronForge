import type { Meta, StoryObj } from '@storybook/react';
import { QuestBadge } from './QuestBadge';

const meta: Meta<typeof QuestBadge> = {
  title: 'Components/QuestBadge',
  component: QuestBadge,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    // Add your argTypes here
  },
};

export default meta;
type Story = StoryObj<typeof QuestBadge>;

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
