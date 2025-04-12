import {useState} from "react";
import { Trash2, Plus } from "lucide-react";
import ExpandedTaskView from "./ExpandedTaskView";

type SubTask = {
  name: string;
  difficulty: "easy" | "medium" | "hard";
  points: number;
  createdAt: number;
};

type Props = {
  name: string;
  contentList?: SubTask[];
  onDelete: () => void;
  onAdd: () => void;
  onExpand: () => void;
  isMentor?: boolean;
};

const THRESHOLD = 15

export default function TaskCard({
  name,
  contentList,
  onDelete,
  onAdd,
  onExpand,
  isMentor
}: Props) {

  const [expandedView, setExpandedView] = useState<boolean>(false)

  const groupedSubTasks = contentList?.reduce((acc, subTask) => {
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

  const totalPointsOverall =
    contentList?.reduce((acc, subTask) => acc + subTask.points, 0) || 0;

  let currentTotal = 0;

  return (
    <div
      onClick={onExpand}
      className="text-black w-80 sm:w-96 bg-white shadow-lg cursor-pointer rounded-lg overflow-hidden hover:border border-white transform hover:scale-105 transition duration-300 ease-in-out"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative flex w-full h-16 bg-[#615251] border-b border-gray-300 justify-between items-center px-4"
      >
        <h1 className="font-bold text-white truncate max-w-[85%]">
          {name?.length > 32 ? name.substring(0, 29) + "..." : name}
        </h1>
        {!isMentor && <div className="flex flex-row gap-4">
          <div
            onClick={(e) => {
              e.stopPropagation();
              onAdd();
            }}
            className="flex hover:bg-black/30 justify-center items-center w-8 h-8"
          >
            <Plus />
          </div>

          <Trash2
            className="hover:opacity-50 cursor-pointer self-center"
            color="red"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
          />
        </div>}
      </div>

      <div className="grid grid-cols-3 font-bold text-center px-4 py-2 border-b border-gray-400 bg-gray-200 text-black">
        <p>Subtask</p>
        <p>Difficulty</p>
        <p>Points</p>
      </div>

      <div className="p-4">
        {groupedSubTasks && currentTotal < THRESHOLD ? (
          Object.entries(groupedSubTasks)
            .sort((a, b) => {
              const toSortableDate = (d: string) => {
                const [dd, mm, yy] = d.split("-");
                return new Date(`20${yy}-${mm}-${dd}`).getTime();
              };
              return toSortableDate(b[0]) - toSortableDate(a[0]);
            })
            .map(([date, tasks], i) => {
              const groupTotal = tasks.reduce((sum, t) => sum + t.points, 0);

              if (currentTotal > THRESHOLD) {
                return <div key={i}></div>;
              }

              return (
                <div key={i} className="mb-4">
                  <div className="flex font-bold text-center text-white px-4 py-2 border-b border-[#75022c] bg-[#75022c] justify-center items-center">
                    <p className={"text-white"}>{date}</p>
                  </div>
                  {tasks.map((task, idx) => {
                    currentTotal += 1;
                    if (currentTotal >= THRESHOLD) {
                      if (currentTotal === THRESHOLD) {
                        return (
                          <div key={idx} className="flex flex-col">
                            <p className="italic">CLICK CARD TO EXPAND</p>
                          </div>
                        );
                      } else {
                        return <div key={idx}></div>;
                      }
                    }
                    return (
                      <div
                        key={idx}
                        className="grid grid-cols-3 gap-4 py-2 border-b border-gray-300"
                      >
                        <p className="truncate">
                          {task.name.length > 32
                            ? task.name.slice(0, 29) + "..."
                            : task.name}
                        </p>
                        <p className="text-center capitalize">
                          {task.difficulty}
                        </p>
                        <p className="text-center">{task.points}</p>
                      </div>
                    );
                  })}
                  <p className="font-semibold text-right mt-1">
                    Total Points: {groupTotal}
                  </p>
                </div>
              );
            })
        ) : (
          <p className="text-center text-gray-500 py-4">No Subtasks Added</p>
        )}
      </div>
      <div className="p-4">Total Points: {totalPointsOverall}</div>
    </div>
  );
}
