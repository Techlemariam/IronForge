import type { Meta, StoryObj } from '@storybook/react';
import { Progress } from './progress';
import { useEffect, useState } from 'react';

const meta: Meta<typeof Progress> = {
  title: 'Components/UI/Progress',
  component: Progress,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof Progress>;

export const Default: Story = {
  render: (args) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [progress, setProgress] = useState(13)

    // eslint-disable-next-line react-hooks/rules-of-hooks
    useEffect(() => {
      const timer = setTimeout(() => setProgress(66), 500)
      return () => clearTimeout(timer)
    }, [])

    return <Progress value={progress} className="w-[60%]" />
  }
};
