import type { Meta, StoryObj } from '@storybook/react';
import { FirstTimeHints } from './FirstTimeHints';

const meta: Meta<typeof FirstTimeHints> = {
  title: 'Components/FirstTimeHints',
  component: FirstTimeHints,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    // Add your argTypes here
  },
};

export default meta;
type Story = StoryObj<typeof FirstTimeHints>;

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
