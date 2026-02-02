import type { Meta, StoryObj } from '@storybook/react';
import { PwaInstallBanner } from './PwaInstallBanner';

const meta: Meta<typeof PwaInstallBanner> = {
  title: 'Components/PwaInstallBanner',
  component: PwaInstallBanner,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    // Add your argTypes here
  },
};

export default meta;
type Story = StoryObj<typeof PwaInstallBanner>;

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
