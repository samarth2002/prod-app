import { z } from 'zod'


export const subTaskSchema = z.object({
    name: z.string(),
    difficulty: z.enum(["easy", "medium", "hard"]),
    points: z.number(),
    createdAt: z.number()
})

export const taskSchema = z.object({
    _id: z.string().uuid().optional(),
    name: z.string().optional(),
    subTasks: z.array(subTaskSchema)
})

export const taskPayloadSchema = taskSchema.extend({
    userId: z.string().uuid(),
});

export const sharedLinkSchema = z.string()