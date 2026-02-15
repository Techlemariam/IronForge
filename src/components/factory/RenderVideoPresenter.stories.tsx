import type { Meta, StoryObj } from '@storybook/react';
import { RenderVideoPresenter } from './RenderVideoPresenter';

const meta: Meta<typeof RenderVideoPresenter> = {
    title: 'Features/Factory/RenderVideoPresenter',
    component: RenderVideoPresenter,
    tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof RenderVideoPresenter>;

export const Default: Story = {
    args: {
        propsJson: JSON.stringify({
            username: "Sisyphus",
            weekNumber: 1,
            strengthGains: 100
        }, null, 2),
        isLoading: false,
        result: null,
        onPropsChange: () => { },
        onSubmit: async (e) => e.preventDefault(),
    },
};

export const Rendering: Story = {
    args: {
        ...Default.args,
        isLoading: true,
    },
};

export const Success: Story = {
    args: {
        ...Default.args,
        result: {
            message: 'Video rendering startad!',
            videoPath: 'renders/sisyphus-week-1.mp4'
        },
    },
};

export const Error: Story = {
    args: {
        ...Default.args,
        result: {
            message: 'Fel vid anrop till API:',
            error: 'Ogiltig JSON. Kontrollera din indata.'
        },
    },
};
