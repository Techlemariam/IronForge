'use client';

import { formatDistanceToNow } from 'date-fns';
import { sv } from 'date-fns/locale';
import { MessageSquare, Mic, User } from 'lucide-react';

interface FactoryTask {
    id: string;
    description: string;
    status: string;
    source: string;
    metadata: any;
    createdAt: Date;
}

interface TaskFeedProps {
    tasks: FactoryTask[];
}

export function TaskFeed({ tasks }: TaskFeedProps) {
    if (tasks.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-slate-500 border border-dashed border-slate-800 rounded-xl">
                <MessageSquare className="w-8 h-8 mb-2 opacity-20" />
                <p>Inga aktiva röstkommandon eller uppgifter i kön.</p>
            </div>
        );
    }

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {tasks.map((task) => (
                <div
                    key={task.id}
                    className="group relative flex flex-col p-4 rounded-xl border border-slate-800 bg-slate-900/40 hover:bg-slate-800/50 transition-all duration-300"
                >
                    <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-2">
                            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
                                {task.source === 'DISCORD' ? <Mic className="w-4 h-4" /> : <MessageSquare className="w-4 h-4" />}
                            </div>
                            <span className="text-xs font-medium uppercase tracking-wider text-slate-500">
                                {task.source}
                            </span>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase border ${task.status === 'PENDING' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                            task.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                                'bg-slate-500/10 text-slate-500 border-slate-500/20'
                            }`}>
                            {task.status}
                        </span>
                    </div>

                    <p className="text-sm text-slate-200 line-clamp-3 mb-4 leading-relaxed italic">
                        "{task.description}"
                    </p>

                    <div className="mt-auto flex items-center justify-between pt-3 border-t border-slate-800/50">
                        <div className="flex items-center space-x-1.5 text-xs text-slate-500">
                            <User className="w-3 h-3" />
                            <span>{task.metadata?.username || 'Okänd Agent'}</span>
                        </div>
                        <span className="text-[10px] text-slate-600">
                            {formatDistanceToNow(new Date(task.createdAt), { addSuffix: true, locale: sv })}
                        </span>
                    </div>
                </div>
            ))}
        </div>
    );
}
