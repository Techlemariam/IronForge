import type { Meta, StoryObj } from '@storybook/react';
import { ArmoryClient } from './ArmoryClient';

const meta: Meta<typeof ArmoryClient> = {
  title: 'Components/ArmoryClient',
  component: ArmoryClient,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    // Add your argTypes here
  },
};

export default meta;
type Story = StoryObj<typeof ArmoryClient>;

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
