import type { Meta, StoryObj } from '@storybook/react';
import { CampaignTracker } from './CampaignTracker';

const meta: Meta<typeof CampaignTracker> = {
  title: 'Components/CampaignTracker',
  component: CampaignTracker,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    // Add your argTypes here
  },
};

export default meta;
type Story = StoryObj<typeof CampaignTracker>;

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
