import React, { useState, useEffect } from "react";
import { ShoppingBag, X, Zap, Shield, Heart, Skull } from "lucide-react";
import {
  getProgressionAction,
  awardGoldAction,
} from "@/actions/progression/core";
import { StorageService } from "../../services/storage";
import { playSound } from "../../utils";

interface MarketplaceProps {
  onClose: () => void;
}

interface ShopItem {
  id: string;
  name: string;
  description: string;
  cost: number;
  icon: React.ReactNode;
  effect: string;
}

const SHOP_ITEMS: ShopItem[] = [
  {
    id: "potion_health",
    name: "Vitality Elixir",
    description: "Instantly restores 50 HP in the Battle Arena.",
    cost: 50,
    icon: <Heart className="w-6 h-6 text-red-500" />,
    effect: "Heal 50 HP",
  },
  {
    id: "scroll_strength",
    name: "Scroll of Strength",
    description: "Permanently increases Arena Strength by 1.",
    cost: 200,
    icon: <Zap className="w-6 h-6 text-yellow-500" />,
    effect: "+1 STR",
  },
  {
    id: "skin_shadow",
    name: "Shadow Form",
    description: "Unlocks the Shadow avatar skin.",
    cost: 1000,
    icon: <Skull className="w-6 h-6 text-purple-500" />,
    effect: "Cosmetic",
  },
  {
    id: "shield_iron",
    name: "Iron Plating",
    description: "Reduces damage taken in the Arena by 5% (Passive).",
    cost: 500,
    icon: <Shield className="w-6 h-6 text-slate-400" />,
    effect: "Passive Def",
  },
];

const Marketplace: React.FC<MarketplaceProps> = ({ onClose }) => {
  const [gold, setGold] = useState<number>(0);
  const [inventory, setInventory] = useState<string[]>([]);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const loadEconomy = async () => {
      const state = await getProgressionAction();
      if (state) {
        setGold(state.gold);
      }
      const currentInv =
        (await StorageService.getState<string[]>("inventory")) || [];
      setInventory(currentInv);
    };
    loadEconomy();
  }, []);

  const handleBuy = async (item: ShopItem) => {
    if (gold >= item.cost) {
      // Deduct Gold
      const result = await awardGoldAction(-item.cost); // Negative award = deduct
      if (result) {
        setGold(result.gold);
      }

      // Add to Inventory (Hypothetical)
      const newInv = [...inventory, item.id];
      setInventory(newInv);
      await StorageService.saveState("inventory", newInv);

      playSound("ding");
      setMessage(`Purchased ${item.name}!`);
      setTimeout(() => setMessage(null), 3000);
    } else {
      playSound("fail");
      setMessage("Not enough Gold!");
      setTimeout(() => setMessage(null), 3000);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-5xl bg-zinc-900 border-2 border-yellow-700 rounded-lg overflow-hidden flex flex-col h-[700px] shadow-[0_0_50px_rgba(234,179,8,0.2)]">
        {/* Header */}
        <div className="p-6 bg-yellow-950/50 border-b border-yellow-800 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <ShoppingBag className="w-8 h-8 text-yellow-500" />
            <div>
              <h1 className="text-3xl font-black text-yellow-500 uppercase tracking-widest">
                Goblin Market
              </h1>
              <p className="text-zinc-400 text-sm font-serif italic">
                &quot;Wares for the worthy...&quot;
              </p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-right">
              <div className="text-xs text-zinc-500 uppercase tracking-widest">
                Your Purse
              </div>
              <div className="text-2xl font-mono text-yellow-400 font-bold">
                {gold} G
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-full transition-colors"
            >
              <X className="w-6 h-6 text-zinc-400" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-8 overflow-y-auto bg-[url('https://www.transparenttextures.com/patterns/black-scales.png')]">
          {message && (
            <div className="mb-6 p-4 bg-yellow-500/10 border border-yellow-500 text-yellow-200 text-center rounded animate-fade-in font-bold">
              {message}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {SHOP_ITEMS.map((item) => (
              <div
                key={item.id}
                className="bg-zinc-950 border border-zinc-800 p-6 rounded-lg group hover:border-yellow-600 transition-all duration-300 relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-yellow-500/5 rounded-full blur-2xl group-hover:bg-yellow-500/10 transition-all"></div>

                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-zinc-900 rounded-lg border border-zinc-700 group-hover:border-yellow-500/50 transition-all">
                    {item.icon}
                  </div>
                  <div className="text-right">
                    <span
                      className={`text-xl font-bold font-mono ${gold >= item.cost ? "text-white" : "text-red-500"}`}
                    >
                      {item.cost} G
                    </span>
                  </div>
                </div>

                <h3 className="text-lg font-bold text-white mb-2">
                  {item.name}
                </h3>
                <p className="text-zinc-400 text-sm mb-6 h-10">
                  {item.description}
                </p>

                <button
                  onClick={() => handleBuy(item)}
                  disabled={gold < item.cost}
                  className={`w-full py-3 rounded font-bold uppercase tracking-wider text-sm transition-all
                                        ${
                                          gold >= item.cost
                                            ? "bg-yellow-700 hover:bg-yellow-600 text-white shadow-lg"
                                            : "bg-zinc-800 text-zinc-600 cursor-not-allowed"
                                        }`}
                >
                  {gold >= item.cost ? "Purchase" : "Insuf. Funds"}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Marketplace;
