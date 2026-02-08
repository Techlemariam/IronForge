import type { Meta, StoryObj } from '@storybook/react';
import { CardioDuelModal } from './CardioDuelModal';

const meta: Meta<typeof CardioDuelModal> = {
  title: 'Components/CardioDuelModal',
  component: CardioDuelModal,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    // Add your argTypes here
  },
};

export default meta;
type Story = StoryObj<typeof CardioDuelModal>;

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
