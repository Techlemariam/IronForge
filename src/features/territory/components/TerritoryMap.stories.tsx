import type { Meta, StoryObj } from '@storybook/react';
import { TerritoryMap } from './TerritoryMap';

const meta: Meta<typeof TerritoryMap> = {
  title: 'Components/TerritoryMap',
  component: TerritoryMap,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    // Add your argTypes here
  },
};

export default meta;
type Story = StoryObj<typeof TerritoryMap>;

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
