import type { Meta, StoryObj } from '@storybook/react';
import { VoiceCommandPresenter } from './VoiceCommandPresenter';

const meta: Meta<typeof VoiceCommandPresenter> = {
    title: 'Features/Factory/VoiceCommandPresenter',
    component: VoiceCommandPresenter,
    tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof VoiceCommandPresenter>;

export const Idle: Story = {
    args: {
        isListening: false,
        transcript: '',
        isProcessing: false,
        error: null,
        onToggleListening: () => { },
        onSubmit: async () => { },
    },
};

export const Listening: Story = {
    args: {
        ...Idle.args,
        isListening: true,
        transcript: 'Initiate territory claim protocols...',
    },
};

export const TranscriptReady: Story = {
    args: {
        ...Idle.args,
        transcript: 'Deploy the recovery agent to the production environment.',
    },
};

export const Processing: Story = {
    args: {
        ...Idle.args,
        transcript: 'Deploy the recovery agent to the production environment.',
        isProcessing: true,
    },
};

export const Error: Story = {
    args: {
        ...Idle.args,
        error: 'Mikrofonåtkomst nekad. Kontrollera behörigheter.',
    },
};
