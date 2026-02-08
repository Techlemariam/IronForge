import type { Meta, StoryObj } from '@storybook/react';
import { MigrationTool } from './MigrationTool';

const meta: Meta<typeof MigrationTool> = {
  title: 'Components/MigrationTool',
  component: MigrationTool,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    // Add your argTypes here
  },
};

export default meta;
type Story = StoryObj<typeof MigrationTool>;

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
