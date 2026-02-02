import type { Meta, StoryObj } from '@storybook/react';
import { PocketCastsPlayer } from './PocketCastsPlayer';

const meta: Meta<typeof PocketCastsPlayer> = {
  title: 'Components/PocketCastsPlayer',
  component: PocketCastsPlayer,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    // Add your argTypes here
  },
};

export default meta;
type Story = StoryObj<typeof PocketCastsPlayer>;

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
