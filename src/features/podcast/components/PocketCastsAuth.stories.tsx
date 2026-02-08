import type { Meta, StoryObj } from '@storybook/react';
import { PocketCastsAuth } from './PocketCastsAuth';

const meta: Meta<typeof PocketCastsAuth> = {
  title: 'Components/PocketCastsAuth',
  component: PocketCastsAuth,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    // Add your argTypes here
  },
};

export default meta;
type Story = StoryObj<typeof PocketCastsAuth>;

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
