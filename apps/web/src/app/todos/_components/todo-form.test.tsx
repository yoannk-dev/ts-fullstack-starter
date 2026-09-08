import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { TodoForm } from "./todo-form";

describe("TodoForm", () => {
  it("shows a validation error and does not submit when title is empty", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockResolvedValue(undefined);

    render(<TodoForm onSubmit={onSubmit} submitLabel="Create todo" pendingLabel="Creating…" />);

    await user.click(screen.getByRole("button", { name: "Create todo" }));

    expect(await screen.findByText(/at least 1 character/i)).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("calls onSubmit with the entered values when the form is valid", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockResolvedValue(undefined);

    render(<TodoForm onSubmit={onSubmit} submitLabel="Create todo" pendingLabel="Creating…" />);

    await user.type(screen.getByLabelText("Title"), "Write the report");
    await user.type(screen.getByLabelText("Description"), "Quarterly numbers");
    await user.selectOptions(screen.getByLabelText("Priority"), "HIGH");
    await user.click(screen.getByRole("button", { name: "Create todo" }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledTimes(1);
    });
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Write the report",
        description: "Quarterly numbers",
        status: "TODO",
        priority: "HIGH",
      }),
      // react-hook-form's handleSubmit also passes the native submit event.
      expect.anything(),
    );
  });

  it("pre-fills fields from defaultValues", () => {
    render(
      <TodoForm
        defaultValues={{ title: "Existing todo", status: "DONE", priority: "LOW" }}
        onSubmit={vi.fn()}
        submitLabel="Save changes"
        pendingLabel="Saving…"
      />,
    );

    expect(screen.getByLabelText("Title")).toHaveValue("Existing todo");
    expect(screen.getByLabelText("Status")).toHaveValue("DONE");
    expect(screen.getByLabelText("Priority")).toHaveValue("LOW");
  });

  it("shows the submit error message when submitError is true", () => {
    render(<TodoForm onSubmit={vi.fn()} submitLabel="Create todo" pendingLabel="Creating…" submitError />);

    expect(screen.getByText("Something went wrong. Please try again.")).toBeInTheDocument();
  });
});
