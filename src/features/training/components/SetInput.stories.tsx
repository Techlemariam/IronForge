import type { Meta, StoryObj } from '@storybook/react';
import { SetInput } from './SetInput';

const meta: Meta<typeof SetInput> = {
  title: 'Components/SetInput',
  component: SetInput,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    // Add your argTypes here
  },
};

export default meta;
type Story = StoryObj<typeof SetInput>;

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
