import type { Meta, StoryObj } from '@storybook/react';
import SetLogForm from './SetLogForm';

const meta: Meta<typeof SetLogForm> = {
  title: 'Components/SetLogForm',
  component: SetLogForm,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    // Add your argTypes here
  },
};

export default meta;
type Story = StoryObj<typeof SetLogForm>;

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
