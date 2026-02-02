import type { Meta, StoryObj } from '@storybook/react';
import { DuelCard } from './DuelCard';

const meta: Meta<typeof DuelCard> = {
  title: 'Components/DuelCard',
  component: DuelCard,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    // Add your argTypes here
  },
};

export default meta;
type Story = StoryObj<typeof DuelCard>;

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
