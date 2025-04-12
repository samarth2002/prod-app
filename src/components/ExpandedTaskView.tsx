import React from "react";
import { X } from "lucide-react";

type SubTask = {
  name: string;
  difficulty: "easy" | "medium" | "hard";
  points: number;
  createdAt: number;
};

type Props = {
  name: string;
  contentList?: SubTask[];
  onClose: () => void;
};

export default function ExpandedTaskView({
  name,
  contentList = [],
  onClose,
}: Props) {

  const groupedSubTasks = contentList.reduce((acc, subTask) => {
    const date = new Date(subTask.createdAt * 1000)
      .toISOString()
      .slice(2, 10)
      .split("-")
      .reverse()
      .join("-");
    if (!acc[date]) acc[date] = [];
    acc[date].push(subTask);
    return acc;
  }, {} as Record<string, SubTask[]>);

  const totalPointsOverall = contentList.reduce(
    (acc, subTask) => acc + subTask.points,
    0
  );

  return (
    <div
      className="text-black fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-center items-center"
      onClick={onClose}
    >
      <div
        onClick={(e) => {
          e.stopPropagation();
        }}
        className="bg-white w-[90%] sm:w-[60%] max-h-[90vh] overflow-y-auto rounded-lg p-6 shadow-xl animate-scaleIn relative"
      >
        <button onClick={onClose} className="absolute right-4 top-4">
          <X size={28} />
        </button>

        <h1 className="text-2xl font-bold mb-4">{name}</h1>

        {Object.entries(groupedSubTasks)
          .sort((a, b) => {
            const toSortableDate = (d: string) => {
              const [dd, mm, yy] = d.split("-");
              return new Date(`20${yy}-${mm}-${dd}`).getTime();
            };
            return toSortableDate(b[0]) - toSortableDate(a[0]);
          })
          .map(([date, tasks], i) => {
            const groupTotal = tasks.reduce((sum, t) => sum + t.points, 0);
            return (
              <div key={i} className="mb-6">
                <h2 className="text-lg font-semibold bg-[#75022c] text-white p-2 text-center rounded">
                  {date}
                </h2>
                <div className="mt-2 space-y-2">
                  {tasks.map((task, idx) => (
                    <div
                      key={idx}
                      className="grid grid-cols-3 gap-4 border-b py-2"
                    >
                      <p>{task.name}</p>
                      <p className="capitalize text-center">
                        {task.difficulty}
                      </p>
                      <p className="text-center">{task.points}</p>
                    </div>
                  ))}
                  <p className="text-right font-semibold">
                    Total Points: {groupTotal}
                  </p>
                </div>
              </div>
            );
          })}

        <p className="text-right mt-4 font-bold text-lg">
          Total Overall: {totalPointsOverall}
        </p>
      </div>
    </div>
  );
}
