import type { Meta, StoryObj } from '@storybook/react';
import { DuelVictoryScreen } from './DuelVictoryScreen';

const meta: Meta<typeof DuelVictoryScreen> = {
  title: 'Components/DuelVictoryScreen',
  component: DuelVictoryScreen,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    // Add your argTypes here
  },
};

export default meta;
type Story = StoryObj<typeof DuelVictoryScreen>;

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
