import type { Meta, StoryObj } from '@storybook/react';
import { EmotePicker } from './EmotePicker';

const meta: Meta<typeof EmotePicker> = {
  title: 'Components/EmotePicker',
  component: EmotePicker,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    // Add your argTypes here
  },
};

export default meta;
type Story = StoryObj<typeof EmotePicker>;

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
