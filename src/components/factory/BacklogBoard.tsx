'use client';

import { useState, useEffect } from 'react';
import { getBacklogItemsAction, startBacklogTaskAction } from '@/actions/factory';


import { BacklogBoardPresenter, BacklogItem } from './BacklogBoardPresenter';

export function BacklogBoard() {
    const [items, setItems] = useState<BacklogItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState<string | null>(null);

    useEffect(() => {
        fetchBacklog();
    }, []);

    const fetchBacklog = async () => {
        const res = await getBacklogItemsAction();
        if (res.success && res.items) {
            setItems(res.items);
        }
        setLoading(false);
    };

    const handleStartTask = async (item: BacklogItem) => {
        setProcessingId(item.id);
        try {
            const res = await startBacklogTaskAction(item.title, item.source);
            if (res && res.success) {
                setItems(prev => prev.filter(i => i.id !== item.id));
            }
        } catch (e) {
            console.error("Task start failed:", e);
        } finally {
            setProcessingId(null);
        }
    };

    return (
        <BacklogBoardPresenter
            items={items}
            loading={loading}
            processingId={processingId}
            onStartTask={handleStartTask}
        />
    );
}
