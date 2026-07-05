import { Injectable } from "@nestjs/common";
import type { CreatePostInput, UpdatePostInput } from "@repo/types";
import { PrismaService } from "../prisma/prisma.service.js";

@Injectable()
export class PostService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.post.findMany({
      orderBy: { created_at: "desc" },
      include: { author: true },
    });
  }

  findOne(id: number) {
    return this.prisma.post.findUnique({
      where: { id },
      include: { author: true },
    });
  }

  create(data: CreatePostInput) {
    return this.prisma.post.create({ data });
  }

  update(id: number, data: UpdatePostInput) {
    return this.prisma.post.update({ where: { id }, data });
  }

  remove(id: number) {
    return this.prisma.post.delete({ where: { id } });
  }
}
