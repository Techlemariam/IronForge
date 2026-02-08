import type { Meta, StoryObj } from '@storybook/react';
import { StrengthContainer } from './StrengthContainer';

const meta: Meta<typeof StrengthContainer> = {
  title: 'Components/StrengthContainer',
  component: StrengthContainer,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    // Add your argTypes here
  },
};

export default meta;
type Story = StoryObj<typeof StrengthContainer>;

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
