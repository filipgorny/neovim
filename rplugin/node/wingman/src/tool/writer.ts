import { ZodSchema } from "zod";

export type Writer = {
  name: string;
  description: string;
  parameters: ZodSchema;
  code(...args: any[]): Promise<any>;
};
