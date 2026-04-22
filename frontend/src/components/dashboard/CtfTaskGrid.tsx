import { ctfTasks } from "@/data/ctfTasks";
import type { CtfTask } from "@/types";

type Props = {
  onSelectTask: (task: CtfTask) => void;
};

export default function CtfTaskGrid({ onSelectTask }: Props) {
  return (
    <section>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
          CTF görevleri
        </h2>
        <p className="text-xs text-slate-500">Kartlara tıklayarak senaryo detayını açın</p>
      </div>
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4">
        {ctfTasks.map((task) => (
          <li key={task.id}>
            <button
              type="button"
              onClick={() => onSelectTask(task)}
              className="flex h-full w-full flex-col rounded-xl border border-slate-700/60 bg-fortress-900/60 p-5 text-left shadow-card transition hover:border-fortress-accent/40 hover:bg-fortress-900/90 focus:outline-none focus:ring-2 focus:ring-fortress-accent/60"
            >
              <span className="mb-2 w-fit rounded-md bg-slate-800 px-2 py-0.5 text-xs font-medium text-slate-300">
                {task.tag}
              </span>
              <h3 className="text-base font-semibold text-white">{task.title}</h3>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-400">{task.description}</p>
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <span className="rounded-md bg-fortress-950 px-2 py-0.5 font-mono text-[11px] text-slate-400">
                  {task.targetEndpoint}
                </span>
                <span className="text-xs font-medium text-slate-500">{task.difficulty}</span>
              </div>
              <span className="mt-3 text-xs font-medium uppercase tracking-wide text-fortress-accent">
                Detayı aç →
              </span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
