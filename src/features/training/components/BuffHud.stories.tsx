import type { Meta, StoryObj } from '@storybook/react';
import { BuffHud } from './BuffHud';

const meta: Meta<typeof BuffHud> = {
  title: 'Components/BuffHud',
  component: BuffHud,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    // Add your argTypes here
  },
};

export default meta;
type Story = StoryObj<typeof BuffHud>;

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
