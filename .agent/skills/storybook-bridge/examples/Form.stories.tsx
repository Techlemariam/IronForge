/**
 * Form Component Story Template
 * 
 * Use this for form inputs and related components.
 * Includes interaction testing examples.
 */
import type { Meta, StoryObj } from '@storybook/react';
import { within, userEvent, expect } from '@storybook/test';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

const meta: Meta<typeof Input> = {
    title: 'UI/Input',
    component: Input,
    tags: ['autodocs'],
    parameters: {
        layout: 'centered',
    },
    argTypes: {
        type: {
            control: 'select',
            options: ['text', 'email', 'password', 'number'],
        },
        disabled: { control: 'boolean' },
    },
};

export default meta;
type Story = StoryObj<typeof Input>;

export const Default: Story = {
    args: {
        placeholder: 'Enter text...',
    },
};

export const WithLabel: Story = {
    render: () => (
        <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="email">Email</Label>
            <Input type="email" id="email" placeholder="titan@ironforge.gg" />
        </div>
    ),
};

export const Disabled: Story = {
    args: {
        disabled: true,
        value: 'Cannot edit this',
    },
};

/**
 * Interactive test - verifies typing works
 */
export const TypeTest: Story = {
    args: {
        placeholder: 'Type here...',
    },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const input = canvas.getByPlaceholderText('Type here...');

        await userEvent.type(input, 'Hello Titan!');
        await expect(input).toHaveValue('Hello Titan!');
    },
};

/**
 * Form submission test
 */
export const FormSubmit: Story = {
    render: () => (
        <form onSubmit={(e) => { e.preventDefault(); alert('Submitted!'); }}>
            <div className="flex gap-2">
                <Input placeholder="Enter name" data-testid="name-input" />
                <Button type="submit">Submit</Button>
            </div>
        </form>
    ),
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const input = canvas.getByTestId('name-input');
        const button = canvas.getByRole('button', { name: /submit/i });

        await userEvent.type(input, 'Titan');
        await userEvent.click(button);
    },
};
