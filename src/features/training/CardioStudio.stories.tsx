import type { Meta, StoryObj } from '@storybook/react';
import { CardioStudio } from './CardioStudio';

const meta: Meta<typeof CardioStudio> = {
  title: 'Components/CardioStudio',
  component: CardioStudio,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    // Add your argTypes here
  },
};

export default meta;
type Story = StoryObj<typeof CardioStudio>;

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
