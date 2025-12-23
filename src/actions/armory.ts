'use server'

import prisma from '@/lib/prisma'
import { createClient } from '@/utils/supabase/server'
import { cache } from 'react'

export type ArmoryItem = {
    id: string
    name: string
    type: string
    rarity: string
    description: string
    power: number
    image: string | null
    locked: boolean
}

export const getArmoryData = cache(async (): Promise<ArmoryItem[]> => {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return []

    // Fetch all available items
    const allItems = await prisma.item.findMany({
        orderBy: { power: 'asc' }
    })

    // Fetch user's inventory
    const userInventory = await prisma.userEquipment.findMany({
        where: { userId: user.id },
        select: { equipmentId: true }
    })

    const ownedIds = new Set(userInventory.map(i => i.equipmentId))

    // Merge and compute "locked" status
    return allItems.map(item => ({
        ...item,
        locked: !ownedIds.has(item.id)
    }))
})
