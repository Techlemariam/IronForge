"use client";

import { useState, useEffect } from "react";
import { Bell } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getUnreadNotificationsAction, markAllNotificationsReadAction } from "@/actions/notifications";
import { toast } from "sonner";

interface Notification {
    id: string;
    type: string;
    message: string;
    read: boolean;
    createdAt: Date | string;
}

export function NotificationBell() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const res = await getUnreadNotificationsAction();
                if (res.success) {
                    setNotifications(res.notifications as Notification[]);

                    // Auto-toast for Oracle Decrees
                    const oracleDecree = res.notifications.find((n: any) => n.type === "ORACLE_DECREE");
                    if (oracleDecree) {
                        toast("🔮 The Oracle has spoken", {
                            description: (oracleDecree as any).message,
                            action: {
                                label: "View",
                                onClick: () => setIsOpen(true),
                            },
                        });
                    }
                }
            } catch (e) {
                console.error(e);
            } finally {
                setIsLoading(false);
            }
        };
        fetchNotifications();
    }, []);

    const handleMarkAllRead = async () => {
        await markAllNotificationsReadAction();
        setNotifications([]);
        setIsOpen(false);
    };

    const unreadCount = notifications.length;

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 rounded-lg hover:bg-zinc-800 transition-colors"
                aria-label="Notifications"
            >
                <Bell className="w-5 h-5 text-zinc-400" />
                {unreadCount > 0 && (
                    <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center"
                    >
                        {unreadCount > 9 ? "9+" : unreadCount}
                    </motion.span>
                )}
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute right-0 top-12 w-80 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl z-50 overflow-hidden"
                    >
                        <div className="p-4 border-b border-zinc-800 flex justify-between items-center">
                            <h3 className="font-bold text-white">Notifications</h3>
                            {unreadCount > 0 && (
                                <button
                                    onClick={handleMarkAllRead}
                                    className="text-xs text-amber-500 hover:text-amber-400"
                                >
                                    Mark all read
                                </button>
                            )}
                        </div>
                        <div className="max-h-80 overflow-y-auto">
                            {notifications.length === 0 ? (
                                <div className="p-8 text-center text-zinc-500">
                                    No new notifications
                                </div>
                            ) : (
                                notifications.map((n) => (
                                    <div
                                        key={n.id}
                                        className="p-4 border-b border-zinc-800/50 hover:bg-zinc-800/50 transition-colors"
                                    >
                                        <p className="text-sm text-white">{n.message}</p>
                                        <p className="text-xs text-zinc-500 mt-1">
                                            {new Date(n.createdAt).toLocaleString()}
                                        </p>
                                    </div>
                                ))
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
