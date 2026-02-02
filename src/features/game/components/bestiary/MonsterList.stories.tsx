import type { Meta, StoryObj } from '@storybook/react';
import { MonsterList } from './MonsterList';

const meta: Meta<typeof MonsterList> = {
  title: 'Components/MonsterList',
  component: MonsterList,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    // Add your argTypes here
  },
};

export default meta;
type Story = StoryObj<typeof MonsterList>;

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
