/**
 * Card Component Story Template
 * 
 * Use this as a starting point for card-style components.
 */
import type { Meta, StoryObj } from '@storybook/react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const meta: Meta<typeof Card> = {
    title: 'UI/Card',
    component: Card,
    tags: ['autodocs'],
    parameters: {
        layout: 'centered',
        backgrounds: { default: 'dark' },
    },
    argTypes: {
        variant: {
            control: 'select',
            options: ['default', 'glass', 'neonsilk', 'outline'],
        },
    },
};

export default meta;
type Story = StoryObj<typeof Card>;

export const Default: Story = {
    render: (args) => (
        <Card {...args} className="w-[350px]">
            <CardHeader>
                <CardTitle>Card Title</CardTitle>
                <CardDescription>Card description goes here.</CardDescription>
            </CardHeader>
            <CardContent>
                <p>Card content with any elements you need.</p>
            </CardContent>
            <CardFooter>
                <Button>Action</Button>
            </CardFooter>
        </Card>
    ),
};

export const Glass: Story = {
    args: {
        variant: 'glass',
    },
    render: (args) => (
        <Card {...args} className="w-[350px]">
            <CardHeader>
                <CardTitle>Glass Card</CardTitle>
                <CardDescription>Frosted glass effect.</CardDescription>
            </CardHeader>
            <CardContent>
                <p>Semi-transparent with backdrop blur.</p>
            </CardContent>
        </Card>
    ),
};

export const NeonSilk: Story = {
    args: {
        variant: 'neonsilk',
    },
    render: (args) => (
        <Card {...args} className="w-[350px]">
            <CardHeader>
                <CardTitle>Neon Silk</CardTitle>
                <CardDescription>High-tech glow effect.</CardDescription>
            </CardHeader>
            <CardContent>
                <p>Subtle primary color glow on hover.</p>
            </CardContent>
        </Card>
    ),
};
