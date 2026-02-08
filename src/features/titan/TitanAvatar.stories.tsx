import type { Meta, StoryObj } from '@storybook/react';
import { TitanAvatar } from './TitanAvatar';

const meta: Meta<typeof TitanAvatar> = {
  title: 'Components/TitanAvatar',
  component: TitanAvatar,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    // Add your argTypes here
  },
};

export default meta;
type Story = StoryObj<typeof TitanAvatar>;

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
