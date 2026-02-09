import type { Meta, StoryObj } from '@storybook/react';
import TheForge from './TheForge';

const meta: Meta<typeof TheForge> = {
  title: 'Components/TheForge',
  component: TheForge,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    // Add your argTypes here
  },
};

export default meta;
type Story = StoryObj<typeof TheForge>;

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
