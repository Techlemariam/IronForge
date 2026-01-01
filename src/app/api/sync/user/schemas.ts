import { z } from "zod";

// Base types matching src/types/index.ts
export const EquipmentCategorySchema = z.enum([
    "Barbell",
    "Weights",
    "Machine",
    "Cardio",
    "Accessory",
    "Rack",
]);

export const EquipmentSchema = z.object({
    id: z.string(),
    name: z.string(),
    category: EquipmentCategorySchema,
    isOwned: z.boolean(),
});

export const AppSettingsSchema = z.object({
    intervalsApiKey: z.string().optional(),
    intervalsAthleteId: z.string().optional(),
    hevyApiKey: z.string().optional(),
    supabaseUrl: z.string().optional(),
    supabaseKey: z.string().optional(),
    valhallaId: z.string().optional(),
    heroName: z.string().optional(),
    hueBridgeIp: z.string().optional(),
    hueUsername: z.string().optional(),
    prioritizeHyperPro: z.boolean().optional(),
});

// Action Payloads
export const SyncActionSchema = z.enum([
    "UPDATE_SETTINGS",
    "UPDATE_GOLD",
    "UPDATE_EQUIPMENT",
    "GET_USER",
]);

export const UpdateSettingsBody = z.object({
    action: z.literal("UPDATE_SETTINGS"),
    payload: AppSettingsSchema,
});

export const UpdateGoldBody = z.object({
    action: z.literal("UPDATE_GOLD"),
    payload: z.number().nonnegative(), // Preventing negative gold exploits
});

export const UpdateEquipmentBody = z.object({
    action: z.literal("UPDATE_EQUIPMENT"),
    payload: z.array(EquipmentSchema),
});

export const GetUserBody = z.object({
    action: z.literal("GET_USER"),
    payload: z.unknown().optional(),
});

// Unified Schema
export const SyncRequestBodySchema = z.intersection(
    z.object({
        userId: z.string().uuid().optional(), // Client might allow this for validation, but we check specific usage
    }),
    z.discriminatedUnion("action", [
        UpdateSettingsBody,
        UpdateGoldBody,
        UpdateEquipmentBody,
        GetUserBody,
    ])
);

export type SyncRequestBody = z.infer<typeof SyncRequestBodySchema>;
