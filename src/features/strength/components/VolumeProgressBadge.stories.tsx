import type { Meta, StoryObj } from '@storybook/react';
import { VolumeProgressBadge } from './VolumeProgressBadge';

const meta: Meta<typeof VolumeProgressBadge> = {
  title: 'Components/VolumeProgressBadge',
  component: VolumeProgressBadge,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    // Add your argTypes here
  },
};

export default meta;
type Story = StoryObj<typeof VolumeProgressBadge>;

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
