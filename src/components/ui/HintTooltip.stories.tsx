import type { Meta, StoryObj } from '@storybook/react';
import { HintTooltip } from './HintTooltip';

const meta: Meta<typeof HintTooltip> = {
  title: 'Components/HintTooltip',
  component: HintTooltip,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    // Add your argTypes here
  },
};

export default meta;
type Story = StoryObj<typeof HintTooltip>;

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
