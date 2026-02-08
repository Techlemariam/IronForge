import type { Meta, StoryObj } from '@storybook/react';
import { StravaUpload } from './StravaUpload';

const meta: Meta<typeof StravaUpload> = {
  title: 'Components/StravaUpload',
  component: StravaUpload,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    // Add your argTypes here
  },
};

export default meta;
type Story = StoryObj<typeof StravaUpload>;

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
