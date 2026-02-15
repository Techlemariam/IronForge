/**
 * Mock for next/headers to prevent errors in Storybook/Browser environment.
 */
export const cookies = () => ({
    get: (name: string) => undefined,
    set: (name: string, value: string, options?: any) => { },
    delete: (name: string) => { },
    getAll: () => [],
});

export const headers = () => new Map();

export const draftMode = () => ({
    isEnabled: false,
    enable: () => { },
    disable: () => { },
});
