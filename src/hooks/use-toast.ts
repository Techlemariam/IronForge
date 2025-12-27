import { useState } from 'react';

type ToastProps = {
    title: string;
    description?: string;
    variant?: 'default' | 'destructive';
};

export function useToast() {
    const toast = ({ title, description, variant }: ToastProps) => {
        // Determine implementation: console logic or context dispatch
        // For now, basic console log until ToastContext is full implemented
        console.log(`[TOAST: ${variant}] ${title}: ${description}`);
    };
    return { toast };
}
