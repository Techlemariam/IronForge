import type { Meta, StoryObj } from '@storybook/react';
import { GarminWidget } from './GarminWidget';

const meta: Meta<typeof GarminWidget> = {
  title: 'Components/GarminWidget',
  component: GarminWidget,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    // Add your argTypes here
  },
};

export default meta;
type Story = StoryObj<typeof GarminWidget>;

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
