import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { useCreateLog } from "../hooks";
import type { FocusLevel, Mood } from "../api";

const schema = z.object({
  date: z.string().min(1, "Date is required"),
  subject: z.string().min(1, "Subject is required"),
  hoursStudied: z.coerce
    .number({ invalid_type_error: "Enter a number" })
    .min(0.5, "At least 0.5 hrs")
    .max(24, "Max 24 hrs"),
  focusLevel: z.enum(["excellent", "good", "average", "low", "very_poor"]),
  mood: z.enum(["happy", "normal", "stressed"]),
});

type FormData = z.infer<typeof schema>;

export function StudyLogForm() {
  const createLog = useCreateLog();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      date: format(new Date(), "yyyy-MM-dd"),
      subject: "",
      hoursStudied: 1,
      focusLevel: "good",
      mood: "normal",
    },
  });

  const onSubmit = (data: FormData) => {
    createLog.mutate(
      {
        date: data.date,
        subject: data.subject,
        hoursStudied: data.hoursStudied,
        focusLevel: data.focusLevel as FocusLevel,
        mood: data.mood as Mood,
      },
      {
        onSuccess: () =>
          reset({
            date: format(new Date(), "yyyy-MM-dd"),
            subject: "",
            hoursStudied: 1,
            focusLevel: "good",
            mood: "normal",
          }),
      }
    );
  };

  return (
    <section className="glass p-6 sm:p-8">
      <h2 className="section-title">📘 Daily Study Log</h2>
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          {/* Date */}
          <div>
            <input type="date" {...register("date")} className="field-input" />
            {errors.date && <p className="error-text">{errors.date.message}</p>}
          </div>

          {/* Subject */}
          <div>
            <input
              type="text"
              placeholder="Subject (e.g. Math)"
              {...register("subject")}
              className="field-input"
            />
            {errors.subject && (
              <p className="error-text">{errors.subject.message}</p>
            )}
          </div>

          {/* Hours */}
          <div>
            <input
              type="number"
              step="0.5"
              placeholder="Hours studied"
              {...register("hoursStudied")}
              className="field-input"
            />
            {errors.hoursStudied && (
              <p className="error-text">{errors.hoursStudied.message}</p>
            )}
          </div>

          {/* Focus level */}
          <div>
            <select {...register("focusLevel")} className="field-input">
              <option value="excellent">🔥 Excellent Focus</option>
              <option value="good">🙂 Good</option>
              <option value="average">😐 Average</option>
              <option value="low">😴 Low</option>
              <option value="very_poor">😫 Very Poor</option>
            </select>
          </div>

          {/* Mood */}
          <div className="sm:col-span-2">
            <select {...register("mood")} className="field-input">
              <option value="happy">😊 Happy</option>
              <option value="normal">😐 Normal</option>
              <option value="stressed">😖 Stressed</option>
            </select>
          </div>
        </div>

        <button
          type="submit"
          disabled={createLog.isPending}
          className="btn-primary w-full py-4 text-base"
        >
          {createLog.isPending ? "Adding…" : "Add Entry"}
        </button>

        {createLog.isError && (
          <p className="error-text text-center mt-2">
            {createLog.error instanceof Error
              ? createLog.error.message
              : "Failed to save entry"}
          </p>
        )}
      </form>
    </section>
  );
}
