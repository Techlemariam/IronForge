import type { Meta, StoryObj } from '@storybook/react';
import { Grimoire } from './Grimoire';

const meta: Meta<typeof Grimoire> = {
  title: 'Components/Grimoire',
  component: Grimoire,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    // Add your argTypes here
  },
};

export default meta;
type Story = StoryObj<typeof Grimoire>;

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
