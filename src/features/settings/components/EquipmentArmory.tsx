import React, { useEffect, useState } from "react";
import ForgeCard from "@/components/ui/ForgeCard";
import { StorageService } from "@/services/storage";
import { EquipmentType } from "@/data/equipmentDb";
import { Toggle } from "@/components/ui/Toggle"; // Assuming we have or will create a Toggle component, otherwise use checkbox

const ALL_EQUIPMENT = [
  { type: EquipmentType.BODYWEIGHT, label: "Bodyweight" },
  { type: EquipmentType.DUMBBELL, label: "Dumbbells" },
  { type: EquipmentType.BARBELL, label: "Barbell" },
  { type: EquipmentType.CABLE, label: "Cable Machine" },
  { type: EquipmentType.MACHINE, label: "Gym Machines" },
  { type: EquipmentType.KETTLEBELL, label: "Kettlebells" },
  { type: EquipmentType.BAND, label: "Resistance Bands" },
  { type: EquipmentType.HYPER_PRO, label: "Freak Athlete Hyper Pro" },
];

const BattleGearSection: React.FC = () => {
  const [inventory, setInventory] = useState<string[]>([]);

  useEffect(() => {
    const loadInv = async () => {
      const inv = (await StorageService.getState<string[]>("inventory")) || [];
      setInventory(inv);
    };
    loadInv();
  }, []);

  if (inventory.length === 0) return null;

  return (
    <div className="animate-fade-in mt-12 pt-12 border-t border-zinc-800">
      <h2 className="text-xl font-bold text-yellow-500 uppercase tracking-widest mb-6">
        Battle Gear (Active Effects)
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {inventory.map((itemId, idx) => (
          <div
            key={idx}
            className="bg-zinc-900 border border-yellow-900/50 p-4 rounded flex items-center gap-4"
          >
            <div className="p-2 bg-yellow-900/20 rounded border border-yellow-700/50 text-yellow-500 text-xs font-mono">
              ITEM
            </div>
            <div>
              <div className="text-white font-bold uppercase">
                {itemId
                  .replace("scroll_", "Scroll of ")
                  .replace("potion_", "Potion of ")
                  .replace("shield_", "Shield of ")
                  .replace("_", " ")}
              </div>
              <div className="text-xs text-zinc-500">Stored in Inventory</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const EquipmentArmory: React.FC = () => {
  const [owned, setOwned] = useState<EquipmentType[]>([]);
  const [hyperProMode, setHyperProMode] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSettings = async () => {
      const eq = (await StorageService.getOwnedEquipment()) || [
        EquipmentType.BODYWEIGHT,
      ];
      const hp = await StorageService.getHyperProPriority();
      setOwned(eq as EquipmentType[]);
      setHyperProMode(hp);
      setLoading(false);
    };
    loadSettings();
  }, []);

  const toggleEquipment = async (type: EquipmentType) => {
    const newOwned = owned.includes(type)
      ? owned.filter((t) => t !== type)
      : [...owned, type];

    setOwned(newOwned);
    await StorageService.saveOwnedEquipment(newOwned as any);
  };

  // const toggleHyperProMode = async () => { ... }

  if (loading)
    return (
      <div className="p-8 text-center text-forge-muted">
        Accessing Armory Database...
      </div>
    );

  return (
    <div className="w-full h-full p-4 md:p-8 overflow-y-auto animate-fade-in">
      <div className="max-w-4xl mx-auto space-y-8">
        <header className="mb-8">
          <h1 className="text-3xl font-heading tracking-widest text-white mb-2">
            ARMORY
          </h1>
          <p className="font-mono text-forge-muted">
            Configure your available arsenal. The Oracle will adapt.
          </p>
        </header>

        {/* HYPER PRO SPECIAL CONFIG */}
        <ForgeCard className="border-l-4 border-l-rarity-epic">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
              <h2 className="text-xl font-bold text-rarity-epic flex items-center gap-2">
                <span className="text-2xl">⚡</span> HYPER PRO PROTOCOL
              </h2>
              <p className="text-sm text-forge-muted mt-1 max-w-xl">
                Enable priority scheduling for{" "}
                <span className="text-white">Freak Athlete Hyper Pro</span>. The
                Oracle will aggressively suggest 10-in-1 compatible variations
                (Nordics, GHDs, Reverse Hypers) whenever possible.
              </p>
            </div>
            <div className="flex items-center gap-3 bg-forge-900/50 p-3 rounded-lg border border-forge-border">
              <Toggle
                checked={hyperProMode}
                onCheckedChange={(val) => {
                  setHyperProMode(val);
                  StorageService.saveHyperProPriority(val);
                }}
              />
              <span className="font-mono text-sm font-bold uppercase">
                {hyperProMode ? "ACTIVE" : "OFFLINE"}
              </span>
            </div>
          </div>
        </ForgeCard>

        {/* STANDARD EQUIPMENT GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {ALL_EQUIPMENT.map((eq) => {
            const isSelected = owned.includes(eq.type);
            const isHyperPro = eq.type === EquipmentType.HYPER_PRO;

            return (
              <div
                key={eq.type}
                onClick={() => toggleEquipment(eq.type)}
                className={`
                                    relative p-4 rounded-lg border-2 cursor-pointer transition-all duration-200
                                    flex items-center justify-between group
                                    ${isSelected
                    ? isHyperPro
                      ? "bg-rarity-epic/10 border-rarity-epic"
                      : "bg-forge-800 border-rarity-common"
                    : "bg-forge-900/30 border-forge-border hover:border-gray-500"
                  }
                                `}
              >
                <span
                  className={`font-heading tracking-wider ${isSelected ? "text-white" : "text-gray-500"}`}
                >
                  {eq.label}
                </span>
                <div
                  className={`w-4 h-4 rounded-sm border ${isSelected ? (isHyperPro ? "bg-rarity-epic border-rarity-epic" : "bg-rarity-common border-rarity-common") : "border-gray-600"}`}
                ></div>
              </div>
            );
          })}
        </div>

        {/* BATTLE GEAR (RPG INVENTORY) */}
        <BattleGearSection />

        <div className="flex justify-center mt-12">
          <p className="text-xs font-mono text-forge-muted opacity-50">
            ID: {StorageService.db ? "DB_CONNECTED" : "DB_OFFLINE"}{" "}
            {/* v1.2.0 */}
          </p>
        </div>
      </div>
    </div>
  );
};

export default EquipmentArmory;
