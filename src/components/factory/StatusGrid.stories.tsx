import type { Meta, StoryObj } from '@storybook/react';
import { StatusGrid } from './StatusGrid';

const meta: Meta<typeof StatusGrid> = {
    title: 'Features/Factory/StatusGrid',
    component: StatusGrid,
    tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof StatusGrid>;

export const Default: Story = {
    args: {
        data: [
            { station: 'Core Oracle', health: 100, current: null },
            { station: 'Remotion Engine', health: 92, current: 'Rendering...' },
            { station: 'Prisma Client', health: 100, current: null },
            { station: 'Sentry Monitor', health: 48, current: 'Alert Truncation' },
            { station: 'N8n Webhook', health: 100, current: null },
        ],
    },
};
