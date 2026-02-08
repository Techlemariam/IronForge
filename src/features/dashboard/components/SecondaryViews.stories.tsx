import type { Meta, StoryObj } from '@storybook/react';
import { SecondaryViews } from './SecondaryViews';

const meta: Meta<typeof SecondaryViews> = {
  title: 'Components/SecondaryViews',
  component: SecondaryViews,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    // Add your argTypes here
  },
};

export default meta;
type Story = StoryObj<typeof SecondaryViews>;

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
