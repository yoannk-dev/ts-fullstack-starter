import type { Route } from "next";

export const todoRoutes = {
  list: "/" as Route,
  new: "/todos/new" as Route,
  detail: (id: number) => `/todos/${String(id)}` as Route,
  edit: (id: number) => `/todos/${String(id)}/edit` as Route,
};
