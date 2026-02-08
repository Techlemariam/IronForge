import type { Meta, StoryObj } from '@storybook/react';
import { HeartRateZoneChart } from './HeartRateZoneChart';

const meta: Meta<typeof HeartRateZoneChart> = {
  title: 'Components/HeartRateZoneChart',
  component: HeartRateZoneChart,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    // Add your argTypes here
  },
};

export default meta;
type Story = StoryObj<typeof HeartRateZoneChart>;

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
