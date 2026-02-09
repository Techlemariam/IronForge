import type { Meta, StoryObj } from '@storybook/react';
import SetRow from './SetRow';

const meta: Meta<typeof SetRow> = {
  title: 'Components/SetRow',
  component: SetRow,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    // Add your argTypes here
  },
};

export default meta;
type Story = StoryObj<typeof SetRow>;

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
