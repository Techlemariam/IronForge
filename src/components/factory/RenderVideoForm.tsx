
"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader } from '@/components/ui/card';
import { Label } from '@/components/ui/label';


import { RenderVideoPresenter } from './RenderVideoPresenter';

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
    <RenderVideoPresenter
      propsJson={propsJson}
      isLoading={isLoading}
      result={result}
      onPropsChange={setPropsJson}
      onSubmit={handleSubmit}
    />
  );
}
