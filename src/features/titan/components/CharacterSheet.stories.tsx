import type { Meta, StoryObj } from '@storybook/react';
import CharacterSheet from './CharacterSheet';

const meta: Meta<typeof CharacterSheet> = {
  title: 'Components/CharacterSheet',
  component: CharacterSheet,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    // Add your argTypes here
  },
};

export default meta;
type Story = StoryObj<typeof CharacterSheet>;

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
