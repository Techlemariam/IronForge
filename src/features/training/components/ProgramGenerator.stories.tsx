import type { Meta, StoryObj } from '@storybook/react';
import { ProgramGenerator } from './ProgramGenerator';

const meta: Meta<typeof ProgramGenerator> = {
  title: 'Components/ProgramGenerator',
  component: ProgramGenerator,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    // Add your argTypes here
  },
};

export default meta;
type Story = StoryObj<typeof ProgramGenerator>;

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
