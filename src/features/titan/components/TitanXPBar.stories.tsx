import type { Meta, StoryObj } from '@storybook/react';
import { TitanXPBar } from './TitanXPBar';

const meta: Meta<typeof TitanXPBar> = {
  title: 'Components/TitanXPBar',
  component: TitanXPBar,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    // Add your argTypes here
  },
};

export default meta;
type Story = StoryObj<typeof TitanXPBar>;

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
