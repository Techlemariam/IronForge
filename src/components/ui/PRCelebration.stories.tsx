import type { Meta, StoryObj } from '@storybook/react';
import PRCelebration from './PRCelebration';

const meta: Meta<typeof PRCelebration> = {
  title: 'Components/PRCelebration',
  component: PRCelebration,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    // Add your argTypes here
  },
};

export default meta;
type Story = StoryObj<typeof PRCelebration>;

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
