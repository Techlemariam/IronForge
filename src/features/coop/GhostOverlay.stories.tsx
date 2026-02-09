import type { Meta, StoryObj } from '@storybook/react';
import GhostOverlay from './GhostOverlay';

const meta: Meta<typeof GhostOverlay> = {
  title: 'Components/GhostOverlay',
  component: GhostOverlay,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    // Add your argTypes here
  },
};

export default meta;
type Story = StoryObj<typeof GhostOverlay>;

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
