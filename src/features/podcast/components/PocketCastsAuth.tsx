"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

interface PocketCastsAuthProps {
    onSuccess?: () => void;
}

export function PocketCastsAuth({ onSuccess }: PocketCastsAuthProps) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const res = await fetch("/api/podcast/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Login failed");
            }

            toast({
                title: "Connected!",
                description: "Your Pocket Casts account is now linked.",
            });

            onSuccess?.();
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Connection Failed",
                description: error.message,
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card className="w-full max-w-md mx-auto">
            <CardHeader>
                <CardTitle>Connect Pocket Casts</CardTitle>
                <CardDescription>
                    Enter your Pocket Casts credentials to access your podcasts during workouts.
                </CardDescription>
            </CardHeader>
            <form onSubmit={handleLogin}>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Email</label>
                        <Input
                            type="email"
                            placeholder="email@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Password</label>
                        <Input
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <p className="text-xs text-muted-foreground italic">
                        Note: If you use Google or Apple to log in, you must set a password in Pocket Casts first.
                    </p>
                </CardContent>
                <CardFooter>
                    <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? "Connecting..." : "Connect Account"}
                    </Button>
                </CardFooter>
            </form>
        </Card>
    );
}
