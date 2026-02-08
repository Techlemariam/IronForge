import type { Meta, StoryObj } from '@storybook/react';
import { SupersetView } from './SupersetView';

const meta: Meta<typeof SupersetView> = {
  title: 'Components/SupersetView',
  component: SupersetView,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    // Add your argTypes here
  },
};

export default meta;
type Story = StoryObj<typeof SupersetView>;

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
