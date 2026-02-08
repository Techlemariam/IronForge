import type { Meta, StoryObj } from '@storybook/react';
import { TvMode } from './TvMode';

const meta: Meta<typeof TvMode> = {
  title: 'Components/TvMode',
  component: TvMode,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    // Add your argTypes here
  },
};

export default meta;
type Story = StoryObj<typeof TvMode>;

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
