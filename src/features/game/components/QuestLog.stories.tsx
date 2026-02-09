import type { Meta, StoryObj } from '@storybook/react';
import QuestLog from './QuestLog';

const meta: Meta<typeof QuestLog> = {
  title: 'Components/QuestLog',
  component: QuestLog,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    // Add your argTypes here
  },
};

export default meta;
type Story = StoryObj<typeof QuestLog>;

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
