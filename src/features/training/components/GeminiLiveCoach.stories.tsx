import type { Meta, StoryObj } from '@storybook/react';
import { GeminiLiveCoach } from './GeminiLiveCoach';

const meta: Meta<typeof GeminiLiveCoach> = {
  title: 'Components/GeminiLiveCoach',
  component: GeminiLiveCoach,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    // Add your argTypes here
  },
};

export default meta;
type Story = StoryObj<typeof GeminiLiveCoach>;

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
