"use client";
import TaskCard from "@/components/TaskCard";
import { Plus, CircleX, Share } from "lucide-react";
import { useState, useEffect, use } from "react";
import ConfirmDialog from "@/components/ConfirmDialog";
import FormModal from "@/components/FormModal";
import axiosInstance from "@/lib/client/api/axiosInstance";
import { useRouter, redirect } from "next/navigation";
import { signIn, signOut, useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import { Paths } from "@/utils/Paths";
import Image from "next/image";
import {
  taskSchema,
  subTaskSchema,
  taskPayloadSchema,
  sharedLinkSchema,
} from "@/lib/validation/validationSchema";
import ExpandedTaskView from "@/components/ExpandedTaskView";

type SubTask = {
  name: string;
  difficulty: "easy" | "medium" | "hard";
  points: number;
  createdAt: number;
};

type Tasks = {
  _id?: string;
  name: string;
  contentList: SubTask[];
};

type Params = {
    id: string;
};

export default function SharedPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();

  const { id } = use(params);

  const [openAddSubTaskModal, setOpenSubTaskModal] = useState(false);
  const [tasks, setTasks] = useState<Tasks[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [name, setName] = useState<string>("");
  const [contentList, setContentList] = useState<SubTask[]>([]);
  const [currentTaskIndex, setCurrentTaskIndex] = useState<number>(0);
  const [deleteTaskConfirmation, setDeleteTaskConfimration] =
    useState<boolean>(false);
  const [expandedTask, setExpandedTask] = useState<Tasks | null>(null);

  const { refetch: fetchTasks } = useQuery({
    queryKey: ["getMentorTasks"],
    queryFn: () => axiosInstance.get(Paths.getMentorTasks + "/" + id),
    enabled: false,
  });

  useEffect(() => {
    const initialize = async () => {
      const { data, isLoading } = await fetchTasks();
      const tasks = data?.data?.tasks;
      const mappedTasks: Tasks[] = tasks?.map((task: any) => ({
        _id: task._id,
        name: task.name || "",
        contentList: task.subTasks || [],
      }));
      setTasks(mappedTasks || []);
      if (!isLoading) {
        setLoading(false);
      }
    };

    initialize();
  }, []);

  return (
    <div className="mt-20 p-6 flex justify-between flex-col items-center gap-12 overflow-y-auto bg-[#c2d19f]">
      {tasks.length === 0 ? (
        <div className="h-dvh flex justify-start items-start">
          <Image src="/noTasks.png" alt="Logo" width={250} height={250} />
        </div>
      ) : (
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 p-4">
          {tasks.map((task, index) => (
            <div key={index} className="mb-10 sm:mb-4 break-inside-avoid">
              <TaskCard
                name={task.name}
                contentList={task.contentList}
                onDelete={() => setDeleteTaskConfimration(true)}
                onExpand={() => setExpandedTask(task)}
                isMentor={true}
                onAdd={() => {
                  setOpenSubTaskModal(true);
                  setCurrentTaskIndex(index);
                  setContentList(tasks[index].contentList);
                }}
              />
            </div>
          ))}
        </div>
      )}
      {expandedTask && (
        <ExpandedTaskView
          name={expandedTask.name}
          contentList={expandedTask.contentList}
          onClose={() => setExpandedTask(null)}
        />
      )}
    </div>
  );
}
