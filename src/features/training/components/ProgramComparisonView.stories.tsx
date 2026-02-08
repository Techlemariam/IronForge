import type { Meta, StoryObj } from '@storybook/react';
import { ProgramComparisonView } from './ProgramComparisonView';

const meta: Meta<typeof ProgramComparisonView> = {
  title: 'Components/ProgramComparisonView',
  component: ProgramComparisonView,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    // Add your argTypes here
  },
};

export default meta;
type Story = StoryObj<typeof ProgramComparisonView>;

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
