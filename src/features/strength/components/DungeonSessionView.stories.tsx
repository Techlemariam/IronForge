import type { Meta, StoryObj } from '@storybook/react';
import DungeonSessionView from './DungeonSessionView';

const meta: Meta<typeof DungeonSessionView> = {
  title: 'Components/DungeonSessionView',
  component: DungeonSessionView,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    // Add your argTypes here
  },
};

export default meta;
type Story = StoryObj<typeof DungeonSessionView>;

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
