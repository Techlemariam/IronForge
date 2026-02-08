import type { Meta, StoryObj } from '@storybook/react';
import { Citadel } from './Citadel';

const meta: Meta<typeof Citadel> = {
  title: 'Components/Citadel',
  component: Citadel,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    // Add your argTypes here
  },
};

export default meta;
type Story = StoryObj<typeof Citadel>;

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
