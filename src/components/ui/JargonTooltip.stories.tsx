import type { Meta, StoryObj } from '@storybook/react';
import { JargonTooltip } from './JargonTooltip';

const meta: Meta<typeof JargonTooltip> = {
  title: 'Components/JargonTooltip',
  component: JargonTooltip,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    // Add your argTypes here
  },
};

export default meta;
type Story = StoryObj<typeof JargonTooltip>;

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
