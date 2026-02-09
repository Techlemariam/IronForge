import type { Meta, StoryObj } from '@storybook/react';
import SkillTree from './SkillTree';

const meta: Meta<typeof SkillTree> = {
  title: 'Components/SkillTree',
  component: SkillTree,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    // Add your argTypes here
  },
};

export default meta;
type Story = StoryObj<typeof SkillTree>;

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
