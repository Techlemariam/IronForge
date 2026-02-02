import type { Meta, StoryObj } from '@storybook/react';
import { WorldMap } from './WorldMap';

const meta: Meta<typeof WorldMap> = {
  title: 'Components/WorldMap',
  component: WorldMap,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    // Add your argTypes here
  },
};

export default meta;
type Story = StoryObj<typeof WorldMap>;

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
