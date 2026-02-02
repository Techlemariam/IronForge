import type { Meta, StoryObj } from '@storybook/react';
import { BattlePassView } from './BattlePassView';

const meta: Meta<typeof BattlePassView> = {
  title: 'Components/BattlePassView',
  component: BattlePassView,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    // Add your argTypes here
  },
};

export default meta;
type Story = StoryObj<typeof BattlePassView>;

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
