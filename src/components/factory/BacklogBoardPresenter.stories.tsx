import type { Meta, StoryObj } from '@storybook/react';
import { BacklogBoardPresenter } from './BacklogBoardPresenter';

const meta: Meta<typeof BacklogBoardPresenter> = {
    title: 'Features/Factory/BacklogBoardPresenter',
    component: BacklogBoardPresenter,
    tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof BacklogBoardPresenter>;

export const Default: Story = {
    args: {
        items: [
            { id: '1', source: 'ROADMAP', title: 'Implement Guild Territories' },
            { id: '2', source: 'DEBT', title: 'Refactor Auth Service' },
        ],
        loading: false,
        processingId: null,
        onStartTask: async () => { },
    },
};

export const Processing: Story = {
    args: {
        ...Default.args,
        processingId: '1',
    },
};

export const Empty: Story = {
    args: {
        ...Default.args,
        items: [],
    },
};

export const Loading: Story = {
    args: {
        ...Default.args,
        loading: true,
    },
};
