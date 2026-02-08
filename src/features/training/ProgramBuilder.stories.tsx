import type { Meta, StoryObj } from '@storybook/react';
import { ProgramBuilder } from './ProgramBuilder';

const meta: Meta<typeof ProgramBuilder> = {
  title: 'Components/ProgramBuilder',
  component: ProgramBuilder,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    // Add your argTypes here
  },
};

export default meta;
type Story = StoryObj<typeof ProgramBuilder>;

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
