import { z } from "zod";

export const composerSchema = z.object({
  text: z.string(),
});

export type ComposerFormValues = z.infer<typeof composerSchema>;
