import type { Meta, StoryObj } from '@storybook/react';
import { EmoteOverlay } from './EmoteOverlay';

const meta: Meta<typeof EmoteOverlay> = {
  title: 'Components/EmoteOverlay',
  component: EmoteOverlay,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    // Add your argTypes here
  },
};

export default meta;
type Story = StoryObj<typeof EmoteOverlay>;

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
