import type { Meta, StoryObj } from '@storybook/react';
import { OracleChat } from './OracleChat';

const meta: Meta<typeof OracleChat> = {
  title: 'Components/OracleChat',
  component: OracleChat,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    // Add your argTypes here
  },
};

export default meta;
type Story = StoryObj<typeof OracleChat>;

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
