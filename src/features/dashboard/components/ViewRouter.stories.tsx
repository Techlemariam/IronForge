import type { Meta, StoryObj } from '@storybook/react';
import { ViewRouter } from './ViewRouter';

const meta: Meta<typeof ViewRouter> = {
  title: 'Components/ViewRouter',
  component: ViewRouter,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    // Add your argTypes here
  },
};

export default meta;
type Story = StoryObj<typeof ViewRouter>;

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
