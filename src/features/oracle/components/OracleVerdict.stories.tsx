import type { Meta, StoryObj } from '@storybook/react';
import { OracleVerdict } from './OracleVerdict';

const meta: Meta<typeof OracleVerdict> = {
  title: 'Components/OracleVerdict',
  component: OracleVerdict,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    // Add your argTypes here
  },
};

export default meta;
type Story = StoryObj<typeof OracleVerdict>;

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
