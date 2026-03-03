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
        if (res?.data?.success && res.data.items) {
            setItems(res.data.items);
        }
        setLoading(false);
    };

    const handleStartTask = async (item: BacklogItem) => {
        setProcessingId(item.id);
        try {
            const res = await startBacklogTaskAction({ itemTitle: item.title, source: item.source });
            if (res?.data?.success) {
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
