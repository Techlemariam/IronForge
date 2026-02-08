import type { Meta, StoryObj } from '@storybook/react';
import { ForgeInput } from './ForgeInput';

const meta: Meta<typeof ForgeInput> = {
  title: 'Components/ForgeInput',
  component: ForgeInput,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    // Add your argTypes here
  },
};

export default meta;
type Story = StoryObj<typeof ForgeInput>;

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
