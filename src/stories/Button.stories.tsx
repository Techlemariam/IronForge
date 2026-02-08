import type { Meta, StoryObj } from '@storybook/react';
import { Button } from '@/components/ui/button';

const meta: Meta<typeof Button> = {
    title: 'UI/Button',
    component: Button,
    tags: ['autodocs'],
    argTypes: {
        variant: {
            control: 'select',
            options: [
                // Standard
                'default', 'destructive', 'outline', 'secondary', 'ghost', 'link',
                // Forge
                'plasma', 'magma', 'pulse', 'rune', 'gold', 'cyan', 'venom', 'beast'
            ],
        },
        size: {
            control: 'select',
            options: ['default', 'sm', 'lg', 'icon'],
        },
        fullWidth: {
            control: 'boolean',
        },
        enableSound: {
            control: 'boolean',
            defaultValue: true,
        }
    },
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Default: Story = {
    args: {
        variant: 'default',
        children: 'Standard Button',
    },
};

export const Plasma: Story = {
    args: {
        variant: 'plasma',
        children: 'Plasma Action',
    },
};

export const Pulse: Story = {
    args: {
        variant: 'pulse',
        children: 'Pulse Intelligence',
    },
};

export const Gold: Story = {
    args: {
        variant: 'gold',
        children: 'Legendary Item',
    },
};

export const Venom: Story = {
    args: {
        variant: 'venom',
        children: 'Success State',
    },
};

export const Destructive: Story = {
    args: {
        variant: 'destructive',
        children: 'Destructive',
    },
};
