import { Suspense } from 'react'
import { getArmoryData } from '@/actions/armory'
import ArmoryClient from '@/components/armory/ArmoryClient'

export default async function ArmoryPage() {
    // Fetch Real Data via Server Action
    const items = await getArmoryData()

    return (
        <Suspense fallback={<div className="text-center font-mono animate-pulse text-white mt-20">Scanning Inventory...</div>}>
            <ArmoryClient initialItems={items} />
        </Suspense>
    )
}
