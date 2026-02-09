import type { Meta, StoryObj } from '@storybook/react';
import BluetoothDebug from './BluetoothDebug';

const meta: Meta<typeof BluetoothDebug> = {
  title: 'Components/BluetoothDebug',
  component: BluetoothDebug,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    // Add your argTypes here
  },
};

export default meta;
type Story = StoryObj<typeof BluetoothDebug>;

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
