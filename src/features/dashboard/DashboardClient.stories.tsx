import type { Meta, StoryObj } from '@storybook/react';
import DashboardClient from './DashboardClient';

const meta: Meta<typeof DashboardClient> = {
  title: 'Components/DashboardClient',
  component: DashboardClient,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    // Add your argTypes here
  },
};

export default meta;
type Story = StoryObj<typeof DashboardClient>;

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
