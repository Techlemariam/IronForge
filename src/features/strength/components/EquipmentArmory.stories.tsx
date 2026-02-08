import type { Meta, StoryObj } from '@storybook/react';
import { EquipmentArmory } from './EquipmentArmory';

const meta: Meta<typeof EquipmentArmory> = {
  title: 'Components/EquipmentArmory',
  component: EquipmentArmory,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    // Add your argTypes here
  },
};

export default meta;
type Story = StoryObj<typeof EquipmentArmory>;

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
