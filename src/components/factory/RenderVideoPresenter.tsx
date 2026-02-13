'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface RenderVideoPresenterProps {
    propsJson: string;
    isLoading: boolean;
    result: { message: string; videoPath?: string; error?: string } | null;
    onPropsChange: (value: string) => void;
    onSubmit: (event: React.FormEvent) => Promise<void>;
}

export function RenderVideoPresenter({
    propsJson,
    isLoading,
    result,
    onPropsChange,
    onSubmit
}: RenderVideoPresenterProps) {
    return (
        <Card className="w-full max-w-2xl bg-slate-900/40 border-slate-800 backdrop-blur-md">
            <CardHeader>
                <CardTitle className="text-white">Remotion Video Factory</CardTitle>
                <CardDescription className="text-slate-400">
                    Starta en ny videorendering. Ange props som ett JSON-objekt.
                </CardDescription>
            </CardHeader>
            <form onSubmit={onSubmit}>
                <CardContent>
                    <div className="grid w-full items-center gap-4">
                        <div className="flex flex-col space-y-1.5">
                            <Label htmlFor="props" className="text-slate-200">Video Props (JSON)</Label>
                            <Textarea
                                id="props"
                                placeholder='{ "username": "Sisyphus", ... }'
                                value={propsJson}
                                onChange={(e) => onPropsChange(e.target.value)}
                                rows={8}
                                disabled={isLoading}
                                className="bg-slate-950 border-slate-800 text-slate-200 focus:border-indigo-500/50 transition-colors"
                            />
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="flex justify-between border-t border-slate-800/50 pt-6">
                    <Button
                        type="submit"
                        disabled={isLoading}
                        className="bg-indigo-500 hover:bg-indigo-600 text-white shadow-lg shadow-indigo-500/20"
                    >
                        {isLoading ? 'Renderar...' : 'Starta Rendering'}
                    </Button>
                </CardFooter>
            </form>
            {result && (
                <CardFooter className="flex flex-col items-start gap-2 border-t border-slate-800/50 pt-6">
                    <p className={`font-semibold ${result.error ? 'text-red-500' : 'text-green-500'}`}>
                        {result.message}
                    </p>
                    {result.videoPath && (
                        <a href={`/${result.videoPath}`} target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:text-indigo-300 hover:underline transition-all">
                            Visa video: {result.videoPath}
                        </a>
                    )}
                    {result.error && <p className="text-sm text-slate-500 font-mono">{result.error}</p>}
                </CardFooter>
            )}
        </Card>
    );
}
