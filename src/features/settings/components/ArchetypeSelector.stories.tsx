import type { Meta, StoryObj } from '@storybook/react';
import { ArchetypeSelector } from './ArchetypeSelector';

const meta: Meta<typeof ArchetypeSelector> = {
  title: 'Components/ArchetypeSelector',
  component: ArchetypeSelector,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    // Add your argTypes here
  },
};

export default meta;
type Story = StoryObj<typeof ArchetypeSelector>;

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
