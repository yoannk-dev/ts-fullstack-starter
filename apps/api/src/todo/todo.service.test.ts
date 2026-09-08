import { NotFoundException } from "@nestjs/common";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { Prisma } from "../../prisma/generated/client.js";
import type { PrismaService } from "../prisma/prisma.service.js";
import { DEFAULT_TAKE, MAX_TAKE, TodoService } from "./todo.service.js";

function createPrismaMock() {
  return {
    todo: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  };
}

function notFoundError() {
  return new Prisma.PrismaClientKnownRequestError("Record to update not found.", {
    code: "P2025",
    clientVersion: "7.8.0",
  });
}

describe("TodoService", () => {
  let prisma: ReturnType<typeof createPrismaMock>;
  let service: TodoService;

  beforeEach(() => {
    prisma = createPrismaMock();
    service = new TodoService(prisma as unknown as PrismaService);
  });

  describe("findAll", () => {
    it("queries with no filters and default pagination when called with no params", () => {
      void service.findAll();

      expect(prisma.todo.findMany).toHaveBeenCalledWith({
        where: {},
        orderBy: { created_at: "desc" },
        include: { author: true },
        take: DEFAULT_TAKE,
        skip: 0,
      });
    });

    it("filters by search and status when provided", () => {
      void service.findAll({ search: "report", status: "TODO" });

      expect(prisma.todo.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { title: { contains: "report" }, status: "TODO" },
        }),
      );
    });

    it("passes through take/skip", () => {
      void service.findAll({ take: 10, skip: 20 });

      expect(prisma.todo.findMany).toHaveBeenCalledWith(expect.objectContaining({ take: 10, skip: 20 }));
    });

    it("clamps take to MAX_TAKE even if a larger value is requested", () => {
      void service.findAll({ take: 9999 });

      expect(prisma.todo.findMany).toHaveBeenCalledWith(expect.objectContaining({ take: MAX_TAKE }));
    });
  });

  describe("findOne", () => {
    it("returns the todo when found", async () => {
      const todo = { id: 1, title: "Write docs" };
      prisma.todo.findUnique.mockResolvedValue(todo);

      await expect(service.findOne(1)).resolves.toBe(todo);
    });

    it("throws NotFoundException when the todo doesn't exist", async () => {
      prisma.todo.findUnique.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe("create", () => {
    it("strips undefined optional fields before calling prisma", () => {
      void service.create({ title: "New todo", authorId: 1, description: undefined, status: undefined });

      expect(prisma.todo.create).toHaveBeenCalledWith({ data: { title: "New todo", authorId: 1 } });
    });
  });

  describe("update", () => {
    it("updates and returns the todo when it exists", async () => {
      const updated = { id: 1, status: "DONE" };
      prisma.todo.update.mockResolvedValue(updated);

      await expect(service.update(1, { status: "DONE" })).resolves.toBe(updated);
      expect(prisma.todo.update).toHaveBeenCalledWith({ where: { id: 1 }, data: { status: "DONE" } });
    });

    it("throws NotFoundException when Prisma reports P2025", async () => {
      prisma.todo.update.mockRejectedValue(notFoundError());

      await expect(service.update(999, { status: "DONE" })).rejects.toBeInstanceOf(NotFoundException);
    });

    it("rethrows any other Prisma/unexpected error unchanged", async () => {
      const constraintError = new Prisma.PrismaClientKnownRequestError("Foreign key constraint failed", {
        code: "P2003",
        clientVersion: "7.8.0",
      });
      prisma.todo.update.mockRejectedValue(constraintError);

      await expect(service.update(1, { status: "DONE" })).rejects.toBe(constraintError);
    });
  });

  describe("remove", () => {
    it("deletes and returns the todo when it exists", async () => {
      const deleted = { id: 1 };
      prisma.todo.delete.mockResolvedValue(deleted);

      await expect(service.remove(1)).resolves.toBe(deleted);
    });

    it("throws NotFoundException when Prisma reports P2025", async () => {
      prisma.todo.delete.mockRejectedValue(notFoundError());

      await expect(service.remove(999)).rejects.toBeInstanceOf(NotFoundException);
    });
  });
});
