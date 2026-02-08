import type { Meta, StoryObj } from '@storybook/react';
import { IronMines } from './IronMines';

const meta: Meta<typeof IronMines> = {
  title: 'Components/IronMines',
  component: IronMines,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    // Add your argTypes here
  },
};

export default meta;
type Story = StoryObj<typeof IronMines>;

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
