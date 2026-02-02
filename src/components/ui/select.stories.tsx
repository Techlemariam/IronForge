import type { Meta, StoryObj } from '@storybook/react';
import { select } from './select';

const meta: Meta<typeof select> = {
  title: 'Components/select',
  component: select,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    // Add your argTypes here
  },
};

export default meta;
type Story = StoryObj<typeof select>;

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
