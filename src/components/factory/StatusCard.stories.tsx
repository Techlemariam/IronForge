import type { Meta, StoryObj } from '@storybook/react';
import { StatusCard } from './StatusCard';

const meta: Meta<typeof StatusCard> = {
    title: 'Features/Factory/StatusCard',
    component: StatusCard,
    tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof StatusCard>;

export const Available: Story = {
    args: {
        status: {
            station: 'Assembly Line 1',
            health: 100,
            current: null,
        },
    },
};

export const Busy: Story = {
    args: {
        status: {
            station: 'Assembly Line 2',
            health: 95,
            current: 'Rendering Workout Video',
        },
    },
};

export const Warning: Story = {
    args: {
        status: {
            station: 'Logic Engine',
            health: 45,
            current: 'Processing Bio-Metrics',
        },
    },
};

export const Error: Story = {
    args: {
        status: {
            station: 'Database Sync',
            health: 10,
            current: 'RECOVERY_PROCEDURE_ACTIVE',
        },
    },
};
