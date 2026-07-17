"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CreateTodoSchema } from "@repo/types";
import { z } from "zod";

export const TodoFormSchema = CreateTodoSchema.omit({ authorId: true, dueDate: true }).extend({
  dueDate: z.string().optional(),
});
export type TodoFormValues = z.infer<typeof TodoFormSchema>;

interface TodoFormProps {
  defaultValues?: Partial<TodoFormValues>;
  onSubmit: (values: TodoFormValues) => Promise<void>;
  submitLabel: string;
  pendingLabel: string;
  submitError?: boolean;
}

export function TodoForm({
  defaultValues,
  onSubmit,
  submitLabel,
  pendingLabel,
  submitError,
}: TodoFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<TodoFormValues>({
    resolver: zodResolver(TodoFormSchema),
    defaultValues: { status: "TODO", priority: "MEDIUM", ...defaultValues },
  });

  return (
    <form
      onSubmit={(e) => {
        void handleSubmit(onSubmit)(e);
      }}
      className="space-y-5"
    >
      <div className="space-y-1.5">
        <label htmlFor="title" className="text-sm font-medium text-gray-700">
          Title
        </label>
        <input
          id="title"
          type="text"
          placeholder="Todo title"
          {...register("title")}
          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition"
        />
        {errors.title && <p className="text-xs text-red-500">{errors.title.message}</p>}
      </div>

      <div className="space-y-1.5">
        <label htmlFor="description" className="text-sm font-medium text-gray-700">
          Description
        </label>
        <textarea
          id="description"
          placeholder="Optional details"
          rows={3}
          {...register("description")}
          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition"
        />
        {errors.description && <p className="text-xs text-red-500">{errors.description.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label htmlFor="status" className="text-sm font-medium text-gray-700">
            Status
          </label>
          <select
            id="status"
            {...register("status")}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition"
          >
            <option value="TODO">To do</option>
            <option value="IN_PROGRESS">In progress</option>
            <option value="DONE">Done</option>
          </select>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="priority" className="text-sm font-medium text-gray-700">
            Priority
          </label>
          <select
            id="priority"
            {...register("priority")}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition"
          >
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
          </select>
        </div>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="dueDate" className="text-sm font-medium text-gray-700">
          Due date
        </label>
        <input
          id="dueDate"
          type="date"
          {...register("dueDate")}
          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition"
        />
      </div>

      {submitError && <p className="text-sm text-red-500">Something went wrong. Please try again.</p>}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full py-2.5 px-4 bg-gray-900 text-white text-sm font-medium rounded-xl hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isSubmitting ? pendingLabel : submitLabel}
      </button>
    </form>
  );
}
