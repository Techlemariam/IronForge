import type { Meta, StoryObj } from '@storybook/react';
import { RankedArenaClient } from './RankedArenaClient';

const meta: Meta<typeof RankedArenaClient> = {
  title: 'Components/RankedArenaClient',
  component: RankedArenaClient,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    // Add your argTypes here
  },
};

export default meta;
type Story = StoryObj<typeof RankedArenaClient>;

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
