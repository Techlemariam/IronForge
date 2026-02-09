import type { Meta, StoryObj } from '@storybook/react';
import AvatarViewer from './AvatarViewer';

const meta: Meta<typeof AvatarViewer> = {
  title: 'Components/AvatarViewer',
  component: AvatarViewer,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    // Add your argTypes here
  },
};

export default meta;
type Story = StoryObj<typeof AvatarViewer>;

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
