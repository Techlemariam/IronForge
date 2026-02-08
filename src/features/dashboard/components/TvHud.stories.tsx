import type { Meta, StoryObj } from '@storybook/react';
import { TvHud } from './TvHud';

const meta: Meta<typeof TvHud> = {
  title: 'Components/TvHud',
  component: TvHud,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    // Add your argTypes here
  },
};

export default meta;
type Story = StoryObj<typeof TvHud>;

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
