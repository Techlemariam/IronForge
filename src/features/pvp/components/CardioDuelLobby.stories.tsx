import type { Meta, StoryObj } from '@storybook/react';
import { CardioDuelLobby } from './CardioDuelLobby';

const meta: Meta<typeof CardioDuelLobby> = {
  title: 'Components/CardioDuelLobby',
  component: CardioDuelLobby,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    // Add your argTypes here
  },
};

export default meta;
type Story = StoryObj<typeof CardioDuelLobby>;

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
