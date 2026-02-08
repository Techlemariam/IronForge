import type { Meta, StoryObj } from '@storybook/react';
import { ActiveDecree } from './ActiveDecree';

const meta: Meta<typeof ActiveDecree> = {
  title: 'Components/ActiveDecree',
  component: ActiveDecree,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    // Add your argTypes here
  },
};

export default meta;
type Story = StoryObj<typeof ActiveDecree>;

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
