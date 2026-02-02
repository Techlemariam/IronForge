import type { Meta, StoryObj } from '@storybook/react';
import { CardiacDriftWarning } from './CardiacDriftWarning';

const meta: Meta<typeof CardiacDriftWarning> = {
  title: 'Components/CardiacDriftWarning',
  component: CardiacDriftWarning,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    // Add your argTypes here
  },
};

export default meta;
type Story = StoryObj<typeof CardiacDriftWarning>;

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
