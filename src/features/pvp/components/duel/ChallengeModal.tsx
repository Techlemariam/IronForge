"use client";

import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Swords, User as UserIcon, Loader2 } from 'lucide-react';
import { createDuelChallengeAction, getPotentialOpponentsAction } from '@/actions/duel';
import { toast } from 'sonner';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ChallengeModalProps {
  isOpen: boolean;
  onClose: () => void;
  potentialOpponents?: Array<{ id: string, heroName: string }>;
  onSelectOpponent?: (id: string) => void;
}

export function ChallengeModal(props: ChallengeModalProps) {
  const { isOpen, onClose } = props;
  const [targetId, setTargetId] = useState('');
  const [loading, setLoading] = useState(false);
  const [opponents, setOpponents] = useState<any[]>([]);
  const [loadingOpponents, setLoadingOpponents] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setLoadingOpponents(true);
      getPotentialOpponentsAction().then(res => {
        if (res.success && res.opponents) {
          setOpponents(res.opponents);
        }
      }).finally(() => setLoadingOpponents(false));
    }
  }, [isOpen]);

  const handleChallenge = async () => {
    if (!targetId) return;

    // If selection callback provided, use it instead of immediate creation
    if (props.onSelectOpponent) {
      props.onSelectOpponent(targetId);
      return;
    }

    setLoading(true);
    try {
      const result = await createDuelChallengeAction(targetId);
      if (result.success) {
        toast.success('Challenge sent successfully!', {
          icon: <Swords className="w-4 h-4" />
        });
        onClose();
      } else {
        toast.error(result.error || 'Failed to send challenge');
      }
    } catch (err) {
      toast.error('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-slate-900 border-slate-800 text-slate-100 sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Swords className="text-amber-500" />
            Issue Challenge
          </DialogTitle>
          <DialogDescription>
            Select a Titan to challenge. Victory goes to the one with the highest training score.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Select Opponent</Label>
            {loadingOpponents ? (
              <div className="flex justify-center p-4">
                <Loader2 className="w-6 h-6 animate-spin text-slate-500" />
              </div>
            ) : (
              <ScrollArea className="h-[300px] border border-slate-800 rounded-md p-2">
                <div className="space-y-2">
                  {opponents.map(opp => (
                    <button
                      key={opp.id}
                      onClick={() => setTargetId(opp.id)}
                      data-testid="opponent-card"
                      className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all border ${targetId === opp.id
                        ? 'bg-amber-900/20 border-amber-500/50'
                        : 'bg-slate-950 border-transparent hover:bg-slate-800'
                        }`}
                    >
                      <Avatar className="w-10 h-10 border border-slate-700">
                        <AvatarImage src={opp.image || undefined} />
                        <AvatarFallback>{opp.heroName?.[0]}</AvatarFallback>
                      </Avatar>
                      <div className="text-left flex-1">
                        <div className="font-bold text-sm text-slate-200">{opp.heroName || 'Unknown Titan'}</div>
                        <div className="text-xs text-slate-500">
                          Lvl {opp.level} • {opp.faction}
                          {opp.titan?.powerRating !== undefined && (
                            <span className="ml-2 text-amber-500 font-mono" data-testid="opponent-rating">
                              PR: {Math.round(opp.titan.powerRating)}
                            </span>
                          )}
                        </div>
                      </div>
                      {targetId === opp.id && <Swords className="w-4 h-4 text-amber-500" />}
                    </button>
                  ))}
                  {opponents.length === 0 && (
                    <p className="text-center text-slate-500 py-4">No active Titans found.</p>
                  )}
                </div>
              </ScrollArea>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={handleChallenge}
            disabled={!targetId || loading}
            className="bg-amber-600 hover:bg-amber-700 text-white font-bold"
          >
            {loading ? 'Sending...' : 'Challenge Titan'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
