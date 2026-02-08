import type { Meta, StoryObj } from '@storybook/react';
import { TutorialTooltip } from './TutorialTooltip';

const meta: Meta<typeof TutorialTooltip> = {
  title: 'Components/TutorialTooltip',
  component: TutorialTooltip,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    // Add your argTypes here
  },
};

export default meta;
type Story = StoryObj<typeof TutorialTooltip>;

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
