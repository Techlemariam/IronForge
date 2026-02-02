import type { Meta, StoryObj } from '@storybook/react';
import { avatar } from './avatar';

const meta: Meta<typeof avatar> = {
  title: 'Components/avatar',
  component: avatar,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    // Add your argTypes here
  },
};

export default meta;
type Story = StoryObj<typeof avatar>;

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
