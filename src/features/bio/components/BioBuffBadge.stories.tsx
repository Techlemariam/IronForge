import type { Meta, StoryObj } from '@storybook/react';
import { BioBuffBadge } from './BioBuffBadge';

const meta: Meta<typeof BioBuffBadge> = {
  title: 'Components/BioBuffBadge',
  component: BioBuffBadge,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    // Add your argTypes here
  },
};

export default meta;
type Story = StoryObj<typeof BioBuffBadge>;

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
