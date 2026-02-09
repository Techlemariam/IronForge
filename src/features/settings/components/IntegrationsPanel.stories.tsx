import type { Meta, StoryObj } from '@storybook/react';
import IntegrationsPanel from './IntegrationsPanel';

const meta: Meta<typeof IntegrationsPanel> = {
  title: 'Components/IntegrationsPanel',
  component: IntegrationsPanel,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    // Add your argTypes here
  },
};

export default meta;
type Story = StoryObj<typeof IntegrationsPanel>;

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
