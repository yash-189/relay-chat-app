import { z } from "zod";

export const composerSchema = z.object({
  text: z.string().trim().min(1, "Message cannot be empty"),
});

export type ComposerFormValues = z.infer<typeof composerSchema>;
