import type { Meta, StoryObj } from "@storybook/react";
import { NeonNoirLogin } from "./NeonNoirLogin";

const meta = {
    title: "Features/Auth/NeonNoirLogin",
    component: NeonNoirLogin,
    parameters: {
        layout: "fullscreen",
    },
    tags: ["autodocs"],
} satisfies Meta<typeof NeonNoirLogin>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
