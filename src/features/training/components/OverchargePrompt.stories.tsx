import type { Meta, StoryObj } from '@storybook/react';
import { OverchargePrompt } from './OverchargePrompt';

const meta: Meta<typeof OverchargePrompt> = {
  title: 'Components/OverchargePrompt',
  component: OverchargePrompt,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    // Add your argTypes here
  },
};

export default meta;
type Story = StoryObj<typeof OverchargePrompt>;

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
