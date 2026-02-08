import type { Meta, StoryObj } from '@storybook/react';
import { FeedPanel } from './FeedPanel';

const meta: Meta<typeof FeedPanel> = {
  title: 'Components/FeedPanel',
  component: FeedPanel,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    // Add your argTypes here
  },
};

export default meta;
type Story = StoryObj<typeof FeedPanel>;

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
