import React from "react";
import { Trash2, Plus } from "lucide-react";

type SubTask = {
  name: string;
  difficulty: "easy" | "medium" | "hard";
  points: number;
};

type Props = {
  name: string;
  contentList?: SubTask[];
  onDelete: () => void;
  onAdd: () => void;
};

export default function TaskCard({ name, contentList, onDelete, onAdd }: Props) {
  let totalPoints = 0


  return (
    <div className="w-96 bg-[#f0f0a3] border rounded-lg overflow-hidden shadow-lg">
      <div className="relative flex w-full h-16 bg-[#ffff54] rounded-t-lg border-b border-gray-300 justify-between items-center px-4">
        <h1 className="font-bold truncate max-w-[85%]" >
          {name?.length > 32 ? name.substring(0, 29) + "..." : name}
        </h1>
        <div className="flex flex-row gap-4">
          <div onClick={onAdd} className= "flex hover:bg-black/30 justify-center items-center w-8 h-8">
            <Plus />
          </div>

          <Trash2
            className="hover:opacity-50 cursor-pointer self-center"
            color="red"
            onClick={onDelete}
          />
        </div>
      </div>

      <div className="grid grid-cols-3 font-bold text-center px-4 py-2 border-b border-gray-400 bg-gray-200">
        <p>Subtask</p>
        <p>Difficulty</p>
        <p>Points</p>
      </div>

      <div className="p-4">
        {contentList?.length ? (
          contentList.map((content, index) => {
            totalPoints += content.points;
            return (
              <div
                key={index}
                className="grid grid-cols-3 gap-4 py-2 border-b border-gray-300"
              >
                <p className="truncate">
                  {content?.name.length > 32
                    ? content?.name.substring(0, 29) + "..."
                    : content?.name}
                </p>
                <p className="text-center capitalize">{content.difficulty}</p>
                <p className="text-center">{content.points}</p>
              </div>
            );
          })
        ) : (
          <p className="text-center text-gray-500 py-4">No Subtasks Added</p>
        )}
      </div>
      <div className="p-4">Total Points: {totalPoints}</div>
    </div>
  );
}
