import type { Meta, StoryObj } from '@storybook/react';
import { HevyImportWizard } from './HevyImportWizard';

const meta: Meta<typeof HevyImportWizard> = {
  title: 'Components/HevyImportWizard',
  component: HevyImportWizard,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    // Add your argTypes here
  },
};

export default meta;
type Story = StoryObj<typeof HevyImportWizard>;

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
