import type { Meta, StoryObj } from '@storybook/react';
import { Input } from './input';

const meta: Meta<typeof Input> = {
  title: 'Components/UI/Input',
  component: Input,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof Input>;

export const Default: Story = {
  args: {
    type: 'email',
    placeholder: 'Email',
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    type: 'email',
    placeholder: 'Email',
  },
};

export const WithLabel: Story = {
  render: (args) => (
    <div className="grid w-full max-w-sm items-center gap-1.5">
      <label htmlFor="email">Email</label>
      <Input {...args} id="email" />
    </div>
  ),
  args: {
    type: 'email',
    placeholder: 'Email',
  },
};
