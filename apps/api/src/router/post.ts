import { z } from "zod";
import { publicProcedure, router } from "../trpc.js";
import { prisma } from "../db.js";
import { CreatePostSchema, UpdatePostSchema } from "@repo/types";

export const postRouter = router({
  findAll: publicProcedure.query(async () => {
    return prisma.post.findMany({
      orderBy: { created_at: "desc" },
    });
  }),

  findById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      return prisma.post.findUnique({
        where: { id: input.id },
      });
    }),

  create: publicProcedure
    .input(CreatePostSchema)
    .mutation(async ({ input }) => {
      return prisma.post.create({
        data: input,
      });
    }),

  update: publicProcedure
    .input(z.object({ id: z.string(), data: UpdatePostSchema }))
    .mutation(async ({ input }) => {
      return prisma.post.update({
        where: { id: input.id },
        data: input.data,
      });
    }),

  delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      return prisma.post.delete({
        where: { id: input.id },
      });
    }),
});
