import type { Meta, StoryObj } from '@storybook/react';
import { LiveSessionHUD } from './LiveSessionHUD';

const meta: Meta<typeof LiveSessionHUD> = {
  title: 'Components/LiveSessionHUD',
  component: LiveSessionHUD,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    // Add your argTypes here
  },
};

export default meta;
type Story = StoryObj<typeof LiveSessionHUD>;

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
