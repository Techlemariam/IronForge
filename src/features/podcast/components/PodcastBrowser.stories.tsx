import type { Meta, StoryObj } from '@storybook/react';
import { PodcastBrowser } from './PodcastBrowser';

const meta: Meta<typeof PodcastBrowser> = {
  title: 'Components/PodcastBrowser',
  component: PodcastBrowser,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    // Add your argTypes here
  },
};

export default meta;
type Story = StoryObj<typeof PodcastBrowser>;

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
