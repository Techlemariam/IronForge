import type { Meta, StoryObj } from '@storybook/react';
import { StrengthLog } from './StrengthLog';

const meta: Meta<typeof StrengthLog> = {
  title: 'Components/StrengthLog',
  component: StrengthLog,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    // Add your argTypes here
  },
};

export default meta;
type Story = StoryObj<typeof StrengthLog>;

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
