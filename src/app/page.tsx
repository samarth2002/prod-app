"use client";
import TaskCard from "@/components/TaskCard";
import { Plus, CircleX, Share } from "lucide-react";
import { useState, useEffect } from "react";
import ConfirmDialog from "@/components/ConfirmDialog";
import FormModal from "@/components/FormModal";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  incrementPoints,
  decrementPoints,
  setPointsBalance,
} from "@/store/pointsSlice";
import axiosInstance from "@/lib/client/api/axiosInstance";
import { useRouter, redirect } from "next/navigation";
import NavBar from "@/components/NavBar";
import { signIn, signOut, useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import { Paths } from "@/utils/Paths";
import LoadingWithText from "@/components/LoadingWithText";
import Image from "next/image";
import {
  taskSchema,
  subTaskSchema,
  taskPayloadSchema,
  sharedLinkSchema
} from "@/lib/validation/validationSchema";
import ExpandedTaskView from "@/components/ExpandedTaskView";
import GlobalPopup from "@/components/GlobalPopup";

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

const EASY_POINTS = 10;
const MEDIUM_POINTS = 50;
const HARD_POINTS = 100;

export default function Home() {
  const dummyStrings = ["Two sum", "Four sum"];
  const router = useRouter();
  const [openAddTaskModal, setOpenFormModal] = useState(false);
  const [openAddSubTaskModal, setOpenSubTaskModal] = useState(false);
  const [rewardScreen, setRewardScreen] = useState(false);
  const [tasks, setTasks] = useState<Tasks[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [name, setName] = useState<string>("");
  const [contentList, setContentList] = useState<SubTask[]>([]);
  const [currentTaskIndex, setCurrentTaskIndex] = useState<number>(0);
  const [isSharePopupOpen, setIsSharePopupOpen] = useState<boolean>(false)
  const [deleteTaskConfirmation, setDeleteTaskConfimration] =
    useState<boolean>(false);
  const [pointsBalance, setPointsBalance] = useState<number>(0);
  const [expandedTask, setExpandedTask] = useState<Tasks | null>(null);
  const [sharedLink, setSharedLink] = useState<string>("")
  const [isLinkCopied, setIsLinkCopied] = useState<boolean>(false)

  const { data: session, status } = useSession();

  useEffect(() => {
    if (status !== "loading" && status !== "authenticated") {
      router.push("/login");
    }
  }, [session, status]);

  const { refetch: fetchTasks } = useQuery({
    queryKey: ["getTasks"],
    queryFn: () => axiosInstance.get(Paths.getTasks + "/" + session?.user?._id),
    enabled: false,
  });

  const { refetch: fetchPoints } = useQuery({
    queryKey: ["getPoints"],
    queryFn: () =>
      axiosInstance.get(`/api/user/get-points/` + session?.user?._id),
    enabled: false,
  });

  const { isLoading: isShareLinkLoading, data: sharedLinkData } = useQuery({
    queryKey: ["generateShareLink"],
    queryFn: () =>
      axiosInstance.post(Paths.generateShareLink, { userId: session?.user?._id}),
  });

  useEffect(() => {
    const setPoints = async () => {
      const { data, isLoading } = await fetchPoints();
      const points = data?.data?.points;
      setPointsBalance(points);

      if (!isLoading) {
        setLoading(false);
      }
    };

    if (status === "authenticated") {
      setPoints();
    }
  }, [tasks]);

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
    if (status === "authenticated") {
      initialize();
    }
  }, [status]);

  if (status === "loading") {
    return <></>;
  }

  const handleTaskAdd = () => {
    setOpenFormModal(true);
  };

  const handleDeleteTask = async (index: number) => {
    console.log(tasks);
    const taskId = tasks[index]?._id;

    if (!taskId) {
      console.error("Task ID not found for deletion");
      return;
    }

    try {
      const res = await axiosInstance.delete(
        `/api/tasks/delete-task/${taskId}`,
        {
          data: { userId: session?.user?._id },
        }
      );

      if (res.data.success) {
        const currentTasks = tasks.filter((_, i) => i !== index);
        setTasks(currentTasks);
      } else {
        console.error("Failed to delete task:", res.data.error);
      }
    } catch (err) {
      console.error("Error deleting task:", err);
    }
  };

  const handleAddTaskSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      userId: session?.user?._id,
      name,
      subTasks: contentList,
    };

    try {
      taskPayloadSchema.parse(payload);
    } catch (err) {
      console.error("Validation failed", err);
      return;
    }

    try {
      const res = await axiosInstance.post("/api/tasks/add-task", payload);

      if (res.data.success) {
        const newTask = res.data.task;
        console.log(newTask);
        const newSubTasks = res.data.task?.subTasks;
        let subTaskSum = 0;
        if (newSubTasks) {
          newSubTasks.forEach((subTask: any) => {
            subTaskSum += subTask?.points;
          });
        }

        setTasks((prevTasks) => [
          ...prevTasks,
          {
            _id: newTask._id,
            name: newTask.name,
            contentList: newTask.subTasks,
          },
        ]);
      } else {
        console.error("Error adding task:", res.data.error);
      }
    } catch (err) {
      console.error("Failed to add task:", err);
    } finally {
      setOpenFormModal(false);
      setName("");
      setContentList([]);
    }
  };

  const handleAddTaskClose = () => {
    setOpenFormModal(false);
    setName("");
    setContentList([]);
  };

  const handleSubTaskAdd = () => {
    setContentList([
      ...contentList,
      {
        name: "",
        difficulty: "easy",
        points: 10,
        createdAt: Math.floor(Date.now() / 1000),
      },
    ]);
  };

  const handleAddSubTaskSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const taskToUpdate = tasks[currentTaskIndex];
    const totalPoints = contentList.reduce((acc, sub) => acc + sub.points, 0);

    const payload = {
      userId: session?.user?._id,
      _id: taskToUpdate._id,
      subTasks: contentList,
      totalPoints,
    };

    try {
      taskPayloadSchema.parse(payload);
    } catch (error) {
      console.error("Validation failed", error);
      return;
    }

    try {
      const res = await axiosInstance.post("/api/tasks/update-task", payload);

      if (res.data.success) {
        const updatedTask = res.data.task;
        const oldTotal = tasks[currentTaskIndex]?.contentList?.reduce(
          (acc, subTask) => subTask?.points + acc,
          0
        );

        const newTotal = updatedTask?.subTasks?.reduce(
          (acc: any, subTask: any) => subTask?.points + acc,
          0
        );

        setTasks((prevTasks) =>
          prevTasks.map((task, index) =>
            index === currentTaskIndex
              ? {
                  _id: updatedTask._id,
                  name: updatedTask.name,
                  contentList: updatedTask.subTasks,
                }
              : task
          )
        );
      } else {
        console.error("Update error:", res.data.error);
      }
    } catch (error) {
      console.error("Failed to update task:", error);
    }

    handleAddSubTaskClose();
  };

  const handleSubTaskChange = <K extends keyof SubTask>(
    index: number,
    key: K,
    value: SubTask[K]
  ) => {
    setContentList((prevList) =>
      prevList.map((subTask, i) =>
        i === index
          ? {
              ...subTask,
              [key]: value,
              points:
                key === "difficulty" && typeof value === "string"
                  ? value === "easy"
                    ? EASY_POINTS
                    : value === "medium"
                    ? MEDIUM_POINTS
                    : HARD_POINTS
                  : key === "points"
                  ? (value as number)
                  : subTask.points,
            }
          : subTask
      )
    );
  };

  const handleDeleteSubTask = (index: number) => {
    const updatedList = contentList.filter((_, i) => i !== index);
    setContentList(updatedList);
  };

  const handleAddSubTaskClose = () => {
    setOpenSubTaskModal(false);
    setName("");
    setContentList([]);
    setCurrentTaskIndex(0);
  };

  const handleShareLink = () => {
    
    if(!isShareLinkLoading){
      const shareLinkFromData = sharedLinkData?.data?.shareLink
      console.log(shareLinkFromData)
      try {
         sharedLinkSchema.parse(shareLinkFromData)
    } catch (err) {
      console.error("Validation failed", err);
      return;
    }
      setSharedLink(shareLinkFromData)
      setIsSharePopupOpen(true)
    }
  }

  return (
    <div className="bg-[#c2d19f] h-dvh text-black">
      <NavBar />
      <div className="mt-20 p-6 flex justify-between flex-col items-center gap-12 overflow-y-auto bg-[#c2d19f]">
        <div className="relative w-full flex flex-col sm:flex-row sm:items-center justify-center gap-4 sm:gap-0 px-4 py-4">
          <div className="sm:absolute sm:left-10 flex justify-center self-center items-center border-2 w-16 h-16 sm:w-20 sm:h-20 rounded-full border-black bg-white shadow">
            <h1 className="font-bold text-xl sm:text-2xl">{pointsBalance}</h1>
          </div>
          <div
            onClick={handleTaskAdd}
            className="flex flex-row justify-center cursor-pointer items-center bg-[#f0f39f69] w-full sm:w-fit p-3 sm:p-4 mt-4 sm:mt-0 rounded-lg border hover:opacity-50 transition-opacity duration-300 ease-in-out"
          >
            <Plus className="mr-2" />
            <span className="font-semibold">Add Task</span>
          </div>

          <div
            onClick={handleShareLink}
            className="sm:absolute justify-center flex flex-row gap-4 sm:right-10 p-2 rounded-md cursor-pointer hover:bg-black/30"
          >
            <p>Share</p>
            <Share />
          </div>
        </div>

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
                  onAdd={() => {
                    setOpenSubTaskModal(true);
                    setCurrentTaskIndex(index);
                    setContentList(tasks[index].contentList);
                  }}
                />
                {deleteTaskConfirmation && (
                  <ConfirmDialog
                    title={"Delete Task?"}
                    subtitle="Action is irreversible"
                    onCancel={() => {
                      setDeleteTaskConfimration(false);
                    }}
                    onConfirm={() => {
                      handleDeleteTask(index);
                      setDeleteTaskConfimration(false);
                    }}
                  />
                )}

                {openAddSubTaskModal && (
                  <FormModal
                    title={tasks[currentTaskIndex]?.name}
                    onFormSubmit={handleAddSubTaskSubmit}
                    closeFormModal={handleAddSubTaskClose}
                  >
                    <div className="flex flex-col gap-6">
                      {contentList.map((content, index) => (
                        <div
                          key={index}
                          className="flex flex-row justify-between"
                        >
                          <input
                            type="text"
                            name="subTask"
                            id="subTask"
                            placeholder="Enter Sub Task"
                            value={contentList[index].name}
                            onChange={(e) =>
                              handleSubTaskChange(index, "name", e.target.value)
                            }
                            className="border border-gray-500 rounded-lg p-2 flex flex-grow mr-4"
                            required
                          />
                          <div className="flex justify-evenly flex-row gap-6">
                            <div>
                              <label
                                htmlFor="difficulty"
                                className="font-semibold"
                              >
                                Difficulty:{" "}
                              </label>
                              <select
                                id="difficulty"
                                value={contentList[index].difficulty}
                                onChange={(e) =>
                                  handleSubTaskChange(
                                    index,
                                    "difficulty",
                                    e.target.value as "easy" | "medium" | "hard"
                                  )
                                }
                                className="border border-gray-500 rounded-lg p-2 h-10 bg-white cursor-pointer"
                              >
                                <option value="easy">Easy</option>
                                <option value="medium">Medium</option>
                                <option value="hard">Hard</option>
                              </select>
                            </div>
                            <div>
                              <label htmlFor="points" className="font-semibold">
                                Points:{" "}
                              </label>

                              <input
                                type="number"
                                name="points"
                                id="points"
                                placeholder="Enter Points"
                                value={contentList[index].points ?? ""}
                                onChange={(e) => {
                                  const newValue =
                                    e.target.value === ""
                                      ? 0
                                      : Number(e.target.value);
                                  handleSubTaskChange(
                                    index,
                                    "points",
                                    newValue
                                  );
                                }}
                                className="border border-gray-500 rounded-lg p-2 bg-white cursor-pointer w-16 h-10"
                              />
                            </div>

                            <button
                              type="button"
                              onClick={() => handleDeleteSubTask(index)}
                              className="px-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition"
                            >
                              ✖
                            </button>
                          </div>
                        </div>
                      ))}
                      <div
                        onClick={handleSubTaskAdd}
                        className="border p-2 flex flex-row hover:opacity-70 transition-opacity duration-100 ease-in-out cursor-pointer"
                      >
                        <Plus />
                        <p>Add Sub Task</p>
                      </div>
                    </div>
                    <p className="ml-auto">
                      Total Points:{" "}
                      {contentList.reduce(
                        (acc, subTask) => acc + subTask.points,
                        0
                      )}
                    </p>
                    <button
                      type={"submit"}
                      className="mt-4 px-4 py-2 bg-red-500 text-white font-semibold rounded-md hover:bg-red-600 transition"
                    >
                      Submit
                    </button>
                  </FormModal>
                )}
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

        {openAddTaskModal && (
          <FormModal
            title="Add a Task"
            subtitle="List the details"
            onFormSubmit={handleAddTaskSubmit}
            closeFormModal={handleAddTaskClose}
          >
            <div className="flex flex-col gap-6">
              <input
                type="text"
                name="title"
                id="title"
                placeholder="Enter title"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="border border-gray-500 rounded-lg p-2 "
                required
              />
              {contentList.map((content, index) => (
                <div key={index} className="flex flex-row justify-between">
                  <input
                    type="text"
                    name="subTask"
                    id="subTask"
                    placeholder="Enter Sub Task"
                    value={contentList[index].name}
                    onChange={(e) =>
                      handleSubTaskChange(index, "name", e.target.value)
                    }
                    className="border border-gray-500 rounded-lg p-2 flex flex-grow mr-4"
                    required
                  />
                  <div className="flex justify-evenly flex-row gap-6">
                    <div>
                      <label htmlFor="difficulty" className="font-semibold">
                        Difficulty:{" "}
                      </label>
                      <select
                        id="difficulty"
                        value={contentList[index].difficulty}
                        onChange={(e) =>
                          handleSubTaskChange(
                            index,
                            "difficulty",
                            e.target.value as "easy" | "medium" | "hard"
                          )
                        }
                        className="border border-gray-500 rounded-lg p-2 h-10 bg-white cursor-pointer"
                      >
                        <option value="easy">Easy</option>
                        <option value="medium">Medium</option>
                        <option value="hard">Hard</option>
                      </select>
                    </div>
                    <div>
                      <label htmlFor="points" className="font-semibold">
                        Points:{" "}
                      </label>

                      <input
                        type="number"
                        name="points"
                        id="points"
                        placeholder="Enter Points"
                        value={contentList[index].points ?? ""}
                        onChange={(e) => {
                          const newValue =
                            e.target.value === "" ? 0 : Number(e.target.value);
                          handleSubTaskChange(index, "points", newValue);
                        }}
                        className="border border-gray-500 rounded-lg p-2 bg-white cursor-pointer w-16 h-10"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeleteSubTask(index)}
                      className="px-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition"
                    >
                      ✖
                    </button>
                  </div>
                </div>
              ))}
              <div
                onClick={handleSubTaskAdd}
                className="border p-2 flex flex-row hover:opacity-70 transition-opacity duration-100 ease-in-out cursor-pointer"
              >
                <Plus />
                <p>Add Sub Task</p>
              </div>
            </div>
            <p className="ml-auto">
              Total Points:{" "}
              {contentList.reduce((acc, subTask) => acc + subTask.points, 0)}
            </p>
            <button
              type={"submit"}
              className="mt-4 px-4 py-2 bg-red-500 text-white font-semibold rounded-md hover:bg-red-600 transition"
            >
              Submit
            </button>
          </FormModal>
        )}

        {isSharePopupOpen && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/70 z-50">
            <div className="relative bg-white p-6 rounded-lg shadow-lg w-[90%] max-w-md text-center">
              <button
                onClick={() => setIsSharePopupOpen(false)}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
              >
                <CircleX className="w-6 h-6" />
              </button>

              <div className="mt-4">
                <p className="text-gray-600 text-sm break-all">
                  {sharedLink || "Generating link..."}
                </p>
                {sharedLink && (
                  <>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(sharedLink);
                        setIsLinkCopied(true);
                      }}
                      className="mt-2 px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none focus:ring focus:ring-gray-400"
                    >
                      Copy Link
                    </button>
                    {isLinkCopied && (
                      <p className="text-green-500 text-sm mt-2">
                        Link Copied!
                      </p>
                    )}
                  </>
                )}
              </div>

              <button
                onClick={() => {setIsSharePopupOpen(false);setIsLinkCopied(false)}}
                className="mt-6 px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 focus:outline-none focus:ring focus:ring-red-300"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
