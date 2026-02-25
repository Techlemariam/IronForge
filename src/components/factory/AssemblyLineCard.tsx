"use client";

import React from "react";
import { motion } from "framer-motion";
import {
    Palette,
    AlertCircle,
    User,
    MessageSquare
} from "lucide-react";
import { AssemblyLineTask } from "@/services/game/FactoryService";

interface AssemblyLineCardProps {
    task: AssemblyLineTask;
}

const getIconForSource = (source: string) => {
    if (source.includes("DISCORD")) return <MessageSquare className="w-3 h-3 text-indigo-400" />;
    return <User className="w-3 h-3 text-slate-400" />;
};

export const AssemblyLineCard: React.FC<AssemblyLineCardProps> = ({ task }) => {
    return (
        <motion.div
            layoutId={task.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            whileHover={{ y: -2 }}
            className="p-3 rounded-lg border border-slate-700/50 bg-slate-800/40 backdrop-blur-sm shadow-sm space-y-2 group"
        >
            <div className="flex items-start justify-between gap-2">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter flex items-center gap-1">
                    {getIconForSource(task.source)}
                    {task.source}
                </span>
                {task.status === "FAILED" && <AlertCircle className="w-3 h-3 text-red-400" />}
            </div>

            <p className="text-xs font-medium text-slate-200 line-clamp-2 leading-tight">
                {task.description}
            </p>

            <div className="flex items-center justify-between pt-1">
                <div className="flex items-center space-x-1">
                    <div className={`w-1.5 h-1.5 rounded-full ${task.status === "IN_PROGRESS" ? "bg-indigo-500 animate-pulse" :
                        task.status === "COMPLETED" ? "bg-emerald-500" : "bg-slate-600"
                        }`} />
                    <span className="text-[9px] text-slate-500 font-bold uppercase truncate max-w-[60px]">
                        {task.status}
                    </span>
                </div>
                <span className="text-[9px] text-slate-600 font-mono">
                    #{task.id.substring(0, 4)}
                </span>
            </div>
        </motion.div>
    );
};
