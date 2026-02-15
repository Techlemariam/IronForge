import type { Meta, StoryObj } from '@storybook/react';
import { CommandCenterPresenter } from './CommandCenterPresenter';

const meta: Meta<typeof CommandCenterPresenter> = {
    title: 'Features/Factory/CommandCenterPresenter',
    component: CommandCenterPresenter,
    tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof CommandCenterPresenter>;

export const Default: Story = {
    args: {
        stats: {
            totalTokensToday: 154000,
            costSekToday: 12.5,
            activeTasks: 3,
            pvsScore: 98,
            factoryMode: 'ON',
        },
        loading: false,
        isEmergencyStop: false,
        onToggleEmergencyStop: () => { },
    },
};

export const EmergencyStop: Story = {
    args: {
        ...Default.args,
        isEmergencyStop: true,
    },
};

export const Loading: Story = {
    args: {
        ...Default.args,
        loading: true,
        stats: null,
    },
};
