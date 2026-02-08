import type { Meta, StoryObj } from '@storybook/react';
import { SocialHub } from './SocialHub';

const meta: Meta<typeof SocialHub> = {
  title: 'Components/SocialHub',
  component: SocialHub,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    // Add your argTypes here
  },
};

export default meta;
type Story = StoryObj<typeof SocialHub>;

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
