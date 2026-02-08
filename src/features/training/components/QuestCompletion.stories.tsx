import type { Meta, StoryObj } from '@storybook/react';
import { QuestCompletion } from './QuestCompletion';

const meta: Meta<typeof QuestCompletion> = {
  title: 'Components/QuestCompletion',
  component: QuestCompletion,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    // Add your argTypes here
  },
};

export default meta;
type Story = StoryObj<typeof QuestCompletion>;

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
