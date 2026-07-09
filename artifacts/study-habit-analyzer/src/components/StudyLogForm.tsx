import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCreateLog } from "../hooks";
import type { FocusLevel, Mood } from "../api";

const schema = z.object({
  date: z.string().min(1, "Date required"),
  subject: z.string().min(1, "Subject required"),
  hoursStudied: z.coerce
    .number({ invalid_type_error: "Enter a number" })
    .min(0.5, "At least 0.5 hrs")
    .max(24, "Max 24 hrs"),
  focusLevel: z.enum(["excellent", "good", "average", "low", "very_poor"]),
  mood: z.enum(["happy", "normal", "stressed"]),
});
type FormData = z.infer<typeof schema>;

function today() {
  return new Date().toLocaleDateString("en-CA"); // YYYY-MM-DD in local time
}

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
      date: today(),
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
      { onSuccess: () => reset({ date: today(), subject: "", hoursStudied: 1, focusLevel: "good", mood: "normal" }) }
    );
  };

  return (
    <section className="glass-panel p-6 sm:p-8">
      <h2 className="text-lg font-bold mb-5 flex items-center gap-2">
        📘 Daily Study Log
      </h2>
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            <input type="date" {...register("date")} className="field-input" data-testid="input-date" />
            {errors.date && <p className="text-destructive text-xs mt-1">{errors.date.message}</p>}
          </div>
          <div>
            <input type="text" placeholder="Subject (e.g. Maths)" {...register("subject")} className="field-input" data-testid="input-subject" />
            {errors.subject && <p className="text-destructive text-xs mt-1">{errors.subject.message}</p>}
          </div>
          <div>
            <input type="number" step="0.5" placeholder="Hours studied" {...register("hoursStudied")} className="field-input" data-testid="input-hours" />
            {errors.hoursStudied && <p className="text-destructive text-xs mt-1">{errors.hoursStudied.message}</p>}
          </div>
          <div>
            <select {...register("focusLevel")} className="field-input" data-testid="select-focus">
              <option value="excellent">🔥 Excellent Focus</option>
              <option value="good">🙂 Good</option>
              <option value="average">😐 Average</option>
              <option value="low">😴 Low</option>
              <option value="very_poor">😫 Very Poor</option>
            </select>
          </div>
          <div className="sm:col-span-2">
            <select {...register("mood")} className="field-input" data-testid="select-mood">
              <option value="happy">😊 Happy</option>
              <option value="normal">😐 Normal</option>
              <option value="stressed">😖 Stressed</option>
            </select>
          </div>
        </div>

        <button
          type="submit"
          disabled={createLog.isPending}
          data-testid="button-add-entry"
          className="w-full py-4 rounded-xl font-bold text-base transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          style={{
            background: "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--primary) / 0.75))",
            color: "hsl(var(--primary-foreground))",
            boxShadow: "0 4px 24px hsl(var(--primary) / 0.3)",
          }}
        >
          {createLog.isPending ? "Adding…" : "Add Entry"}
        </button>

        {createLog.isError && (
          <p className="text-destructive text-xs text-center mt-2">
            {createLog.error instanceof Error ? createLog.error.message : "Failed to save"}
          </p>
        )}
      </form>
    </section>
  );
}
