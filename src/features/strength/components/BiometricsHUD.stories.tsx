import type { Meta, StoryObj } from '@storybook/react';
import { BiometricsHUD } from './BiometricsHUD';

const meta: Meta<typeof BiometricsHUD> = {
  title: 'Components/BiometricsHUD',
  component: BiometricsHUD,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    // Add your argTypes here
  },
};

export default meta;
type Story = StoryObj<typeof BiometricsHUD>;

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
