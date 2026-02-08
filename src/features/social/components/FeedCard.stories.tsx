import type { Meta, StoryObj } from '@storybook/react';
import { FeedCard } from './FeedCard';

const meta: Meta<typeof FeedCard> = {
  title: 'Components/FeedCard',
  component: FeedCard,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    // Add your argTypes here
  },
};

export default meta;
type Story = StoryObj<typeof FeedCard>;

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
