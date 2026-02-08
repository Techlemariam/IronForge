import type { Meta, StoryObj } from '@storybook/react';
import { PRBadge } from './PRBadge';

const meta: Meta<typeof PRBadge> = {
  title: 'Components/PRBadge',
  component: PRBadge,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    // Add your argTypes here
  },
};

export default meta;
type Story = StoryObj<typeof PRBadge>;

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
