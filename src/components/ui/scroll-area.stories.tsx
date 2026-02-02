import type { Meta, StoryObj } from '@storybook/react';
import { ScrollArea } from './scroll-area';

const meta: Meta<typeof ScrollArea> = {
  title: 'Components/UI/ScrollArea',
  component: ScrollArea,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  args: {
    className: 'h-[200px] w-[350px] rounded-md border p-4',
  },
};

export default meta;
type Story = StoryObj<typeof ScrollArea>;

export const Default: Story = {
  render: (args) => (
    <ScrollArea {...args}>
      <div className="p-4">
        <h4 className="mb-4 text-sm font-medium leading-none">Tags</h4>
        {Array.from({ length: 50 }).map((_, i, a) => (
          <div key={i} className="text-sm">
            Tag {a.length - i}
          </div>
        ))}
      </div>
    </ScrollArea>
  ),
};
