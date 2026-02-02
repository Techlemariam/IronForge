import type { Meta, StoryObj } from '@storybook/react';
import { RecoveryOracleVerdict } from './RecoveryOracleVerdict';

const meta: Meta<typeof RecoveryOracleVerdict> = {
  title: 'Components/RecoveryOracleVerdict',
  component: RecoveryOracleVerdict,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    // Add your argTypes here
  },
};

export default meta;
type Story = StoryObj<typeof RecoveryOracleVerdict>;

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
