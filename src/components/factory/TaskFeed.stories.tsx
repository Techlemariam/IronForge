import type { Meta, StoryObj } from '@storybook/react';
import { TaskFeed } from './TaskFeed';

const meta: Meta<typeof TaskFeed> = {
    title: 'Features/Factory/TaskFeed',
    component: TaskFeed,
    tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof TaskFeed>;

export const Default: Story = {
    args: {
        tasks: [
            {
                id: '1',
                description: 'Update the strength gains visualization for Sisyphus.',
                status: 'PENDING',
                source: 'DISCORD',
                metadata: { username: 'Alex' },
                createdAt: new Date(),
            },
            {
                id: '2',
                description: 'Verify the territory balance for the current sprint.',
                status: 'COMPLETED',
                source: 'WEB_UI',
                metadata: { username: 'Manager' },
                createdAt: new Date(Date.now() - 1000 * 60 * 60),
            },
        ],
    },
};

export const Empty: Story = {
    args: {
        tasks: [],
    },
};
