import { z } from "zod";

export enum Role {
  USER = "user",
  ADMIN = "admin",
}

export const userSchema = z.object({
  id: z.string(),
  username: z.string(),
  email: z.string().email(),
  role: z.nativeEnum(Role),
});

export type User = z.infer<typeof userSchema>;
