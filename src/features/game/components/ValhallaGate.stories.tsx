import type { Meta, StoryObj } from '@storybook/react';
import ValhallaGate from './ValhallaGate';

const meta: Meta<typeof ValhallaGate> = {
  title: 'Components/ValhallaGate',
  component: ValhallaGate,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    // Add your argTypes here
  },
};

export default meta;
type Story = StoryObj<typeof ValhallaGate>;

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
