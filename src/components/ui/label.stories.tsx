import type { Meta, StoryObj } from '@storybook/react';
import { Label } from './label';
import { Checkbox } from './checkbox';

const meta: Meta<typeof Label> = {
  title: 'Components/UI/Label',
  component: Label,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof Label>;

export const Default: Story = {
  render: (args) => (
    <div>
      <div className="flex items-center space-x-2">
        <Checkbox id="terms" />
        <Label htmlFor="terms" {...args}>Accept terms and conditions</Label>
      </div>
    </div>
  ),
};
