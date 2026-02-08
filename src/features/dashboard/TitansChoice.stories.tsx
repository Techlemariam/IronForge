import type { Meta, StoryObj } from '@storybook/react';
import { TitansChoice } from './TitansChoice';

const meta: Meta<typeof TitansChoice> = {
  title: 'Components/TitansChoice',
  component: TitansChoice,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    // Add your argTypes here
  },
};

export default meta;
type Story = StoryObj<typeof TitansChoice>;

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
