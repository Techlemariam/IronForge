import type { Meta, StoryObj } from '@storybook/react';
import { HRRecoveryDisplay } from './HRRecoveryDisplay';

const meta: Meta<typeof HRRecoveryDisplay> = {
  title: 'Components/HRRecoveryDisplay',
  component: HRRecoveryDisplay,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    // Add your argTypes here
  },
};

export default meta;
type Story = StoryObj<typeof HRRecoveryDisplay>;

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
