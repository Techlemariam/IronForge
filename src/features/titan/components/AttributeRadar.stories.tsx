import type { Meta, StoryObj } from '@storybook/react';
import { AttributeRadar } from './AttributeRadar';

const meta: Meta<typeof AttributeRadar> = {
  title: 'Components/AttributeRadar',
  component: AttributeRadar,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    // Add your argTypes here
  },
};

export default meta;
type Story = StoryObj<typeof AttributeRadar>;

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
