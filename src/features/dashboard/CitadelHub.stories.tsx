import type { Meta, StoryObj } from '@storybook/react';
import { CitadelHub } from './CitadelHub';

const meta: Meta<typeof CitadelHub> = {
  title: 'Components/CitadelHub',
  component: CitadelHub,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    // Add your argTypes here
  },
};

export default meta;
type Story = StoryObj<typeof CitadelHub>;

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
