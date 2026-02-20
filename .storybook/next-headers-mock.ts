/**
 * Mock for next/headers to prevent errors in Storybook/Browser environment.
 */
export const cookies = () => ({
    get: (_name: string) => undefined,
    set: (_name: string, _value: string, _options?: any) => { },
    delete: (_name: string) => { },
    getAll: () => [],
});

export const headers = () => new Map();

export const draftMode = () => ({
    isEnabled: false,
    enable: () => { },
    disable: () => { },
});
