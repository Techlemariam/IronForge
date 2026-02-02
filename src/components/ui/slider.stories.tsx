import type { Meta, StoryObj } from '@storybook/react';
import { slider } from './slider';

const meta: Meta<typeof slider> = {
  title: 'Components/slider',
  component: slider,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    // Add your argTypes here
  },
};

export default meta;
type Story = StoryObj<typeof slider>;

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
