export type ActionState<T> = {
    fieldErrors?: Record<string, string[] | undefined>;
    error?: string;
    data?: T;
};
