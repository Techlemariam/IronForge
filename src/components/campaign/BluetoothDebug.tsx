"use client";

import React, { useState, useEffect } from "react";
import { bluetoothService, BioData } from "@/services/BluetoothService";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Heart, Activity, Battery, Zap } from "lucide-react";

const BluetoothDebug = () => {
    const [data, setData] = useState<BioData | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [history, setHistory] = useState<number[]>([]);

    const handleConnect = async () => {
        try {
            setError(null);
            await bluetoothService.connect((newData) => {
                setData(newData);
                setHistory((prev) => [...prev.slice(-19), newData.heartRate]); // Keep last 20
            });
            setIsConnected(true);
        } catch (err: any) {
            setError(err.message || "Failed to connect");
            setIsConnected(false);
        }
    };

    const handleDisconnect = () => {
        bluetoothService.disconnect();
        setIsConnected(false);
        setData(null);
    };

    // RR Interval calculation to HRV (RMSSD approximation for visual check)
    const rrDisplay = data?.rrIntervals ? data.rrIntervals.join(", ") : "None";

    return (
        <Card className="w-full max-w-md mx-auto mt-10 border-2 border-zinc-800 bg-zinc-950 text-zinc-100">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Heart className={`w-6 h-6 ${data?.heartRate ? "text-red-500 animate-pulse" : "text-zinc-500"}`} />
                    Polar H10 Debugger
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Connection Status */}
                <div className="flex justify-between items-center">
                    <span className={`text-sm font-mono ${isConnected ? "text-green-500" : "text-red-500"}`}>
                        {isConnected ? "CONNECTED" : "DISCONNECTED"}
                    </span>
                    {!isConnected ? (
                        <Button onClick={handleConnect} variant="default" className="bg-blue-600 hover:bg-blue-500">
                            Pair Device
                        </Button>
                    ) : (
                        <Button onClick={handleDisconnect} variant="destructive">
                            Disconnect
                        </Button>
                    )}
                </div>

                {error && (
                    <div className="p-3 text-sm text-red-200 bg-red-900/40 rounded border border-red-800">
                        {error}
                    </div>
                )}

                {/* Live Metrics */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-zinc-900/50 p-4 rounded-lg flex flex-col items-center justify-center border border-zinc-800">
                        <span className="text-zinc-500 text-xs uppercase mb-1">Heart Rate</span>
                        <span className="text-4xl font-bold font-mono tracking-tighter text-white">
                            {data ? data.heartRate : "--"}
                        </span>
                        <span className="text-xs text-zinc-600">BPM</span>
                    </div>

                    <div className="bg-zinc-900/50 p-4 rounded-lg flex flex-col items-center justify-center border border-zinc-800">
                        <span className="text-zinc-500 text-xs uppercase mb-1">RR Intervals</span>
                        <Activity className="w-8 h-8 text-blue-500 mb-1 opacity-50" />
                        <span className="text-xs text-zinc-400 text-center break-all line-clamp-2">
                            {data?.rrIntervals ? `${data.rrIntervals[0]}ms` : "--"}
                        </span>
                    </div>
                </div>

                {/* Mini Graph */}
                <div className="h-16 flex items-end gap-1 p-2 bg-zinc-900/50 rounded border border-zinc-800">
                    {history.map((hr, i) => (
                        <div
                            key={i}
                            className="flex-1 bg-red-500/50 rounded-t"
                            style={{ height: `${(hr / 200) * 100}%` }}
                        />
                    ))}
                </div>

                <div className="text-[10px] text-zinc-600 font-mono text-center">
                    Supports standard BLE Heart Rate Service (0x180D)
                </div>
            </CardContent>
        </Card>
    );
};

export default BluetoothDebug;
