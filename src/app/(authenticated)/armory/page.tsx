import { getArmoryData } from '@/actions/economy/armory';
import ArmoryClient from '@/features/strength/components/armory/ArmoryClient';
import { Suspense } from 'react';

export default async function ArmoryPage() {
  // Fetch Real Data via Server Action
  const items = await getArmoryData();

  return (
    <Suspense
      fallback={
        <div className="text-center font-mono animate-pulse text-white mt-20">
          Scanning Inventory...
        </div>
      }
    >
      <ArmoryClient initialItems={items} />
    </Suspense>
  );
}
