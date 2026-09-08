import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";
import "@testing-library/jest-dom/vitest";

// RTL's auto-cleanup only registers itself when `afterEach` exists as a
// global, which it doesn't here (test.globals is left off on purpose).
afterEach(cleanup);
