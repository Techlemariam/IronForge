
"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

const defaultProps = {
  username: "TestUser",
  weekNumber: 1,
  strengthGains: 100
};

export function RenderVideoForm() {
  const [propsJson, setPropsJson] = useState(JSON.stringify(defaultProps, null, 2));
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{ message: string; videoPath?: string; error?: string } | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setResult(null);

    let props;
    try {
      props = JSON.parse(propsJson);
    } catch (error) {
      setIsLoading(false);
      setResult({ message: 'Fel:', error: 'Ogiltig JSON. Kontrollera din indata.' });
      return;
    }

    try {
      const response = await fetch('/api/factory/render-video', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ props }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Något gick fel på servern.');
      }
      
      setResult({ message: data.message, videoPath: data.videoPath });

    } catch (error: any) {
      setResult({ message: 'Fel vid anrop till API:', error: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Remotion Video Factory</CardTitle>
        <CardDescription>
          Starta en ny videorendering. Ange props som ett JSON-objekt.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent>
          <div className="grid w-full items-center gap-4">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="props">Video Props (JSON)</Label>
              <Textarea
                id="props"
                placeholder='{ "username": "Sisyphus", ... }'
                value={propsJson}
                onChange={(e) => setPropsJson(e.target.value)}
                rows={8}
                disabled={isLoading}
              />
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Renderar...' : 'Starta Rendering'}
          </Button>
        </CardFooter>
      </form>
      {result && (
        <CardFooter className="flex flex-col items-start gap-2">
            <p className={`font-semibold ${result.error ? 'text-red-500' : 'text-green-500'}`}>
                {result.message}
            </p>
            {result.videoPath && (
                <a href={`/${result.videoPath}`} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                    Visa video: {result.videoPath}
                </a>
            )}
            {result.error && <p className="text-sm text-gray-400">{result.error}</p>}
        </CardFooter>
      )}
    </Card>
  );
}
