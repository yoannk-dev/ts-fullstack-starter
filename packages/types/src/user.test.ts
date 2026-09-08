import { describe, expect, it } from "vitest";
import { CreateUserSchema, UserSchema } from "./user";

describe("UserSchema", () => {
  it("accepts a valid user", () => {
    expect(UserSchema.safeParse({ id: 1, email: "admin@example.com", name: "Admin" }).success).toBe(true);
  });

  it("requires name to be present, even if null", () => {
    expect(UserSchema.safeParse({ id: 1, email: "admin@example.com", name: null }).success).toBe(true);
    const { name: _name, ...withoutName } = { id: 1, email: "admin@example.com", name: null };
    expect(UserSchema.safeParse(withoutName).success).toBe(false);
  });

  it("rejects an invalid email", () => {
    expect(UserSchema.safeParse({ id: 1, email: "not-an-email", name: null }).success).toBe(false);
  });
});

describe("CreateUserSchema", () => {
  it("does not require an id", () => {
    expect(CreateUserSchema.safeParse({ email: "new@example.com", name: null }).success).toBe(true);
  });
});
