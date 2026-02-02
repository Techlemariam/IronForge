import type { Meta, StoryObj } from '@storybook/react';
import { OracleCard } from './OracleCard';

const meta: Meta<typeof OracleCard> = {
  title: 'Components/OracleCard',
  component: OracleCard,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    // Add your argTypes here
  },
};

export default meta;
type Story = StoryObj<typeof OracleCard>;

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
