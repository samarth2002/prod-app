"use client";
import TaskCard from "@/components/TaskCard";
import { Plus, CircleX } from "lucide-react";
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
import { useRouter } from "next/navigation";


type SubTask = {
  name: string;
  difficulty: "easy" | "medium" | "hard";
  points: number;
  createdAt: number;
};

type Tasks = {
  _id?: string,
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
  const [deleteTaskConfirmation, setDeleteTaskConfimration] =
    useState<boolean>(false);

  const points = useAppSelector((state)=> state.points.pointsBalance)
  const dispatch = useAppDispatch();

  useEffect(() => {
      const fetchTasks = async () => {
        try {
          const res = await axiosInstance.get("/api/tasks/get-tasks");
          const data = await res.data.tasks;
           const mappedTasks: Tasks[] = data.map((task: any) => ({
            _id: task._id,
             name: task.name || "",
             contentList: task.subTasks || [],
           }));
           setTasks(mappedTasks || []);
        } catch (err) {
          console.error("Failed to fetch tasks:", err);
        } finally {
          setLoading(false);
        }
      };

      fetchTasks()
  }, []);
   

  const handleTaskAdd = () => {
    setOpenFormModal(true);
  };

  const handleDeleteTask = async (index: number) => {
    console.log(tasks)
    const taskId = tasks[index]?._id;

    if (!taskId) {
      console.error("Task ID not found for deletion");
      return;
    }

    try {
      const res = await axiosInstance.delete(`/api/tasks/delete-task/${taskId}`);

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
        name,
        subTasks: contentList,
      };

      try {
        const res = await axiosInstance.post("/api/tasks/add-task", payload);

        if (res.data.success) {
          const newTask = res.data.task;
          console.log(newTask)
          const newSubTasks = res.data.task?.subTasks
          let subTaskSum = 0
          if (newSubTasks) {
            newSubTasks.forEach((subTask: any)=>{
              subTaskSum += subTask?.points
            })
          }
          dispatch(incrementPoints(subTaskSum))

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
      { name: "", difficulty: "easy", points: 10, createdAt: Math.floor(Date.now()/1000) },
    ]);

  };

  
  const handleAddSubTaskSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const taskToUpdate = tasks[currentTaskIndex];
    const totalPoints = contentList.reduce((acc, sub) => acc + sub.points, 0);
    console.log(taskToUpdate)
    const payload = {
      _id: taskToUpdate._id, 
      subTasks: contentList,
      totalPoints,
    };

    try {
      const res = await axiosInstance.post("/api/tasks/update-task", payload);

      if (res.data.success) {
        const updatedTask = res.data.task;
        const oldTotal = tasks[currentTaskIndex]?.contentList?.reduce(
          (acc, subTask) => subTask?.points + acc,
          0
        );

        const newTotal = updatedTask?.subTasks?.reduce(
          (acc:any, subTask:any) => subTask?.points + acc,
          0
        );
        console.log(oldTotal)
        console.log(newTotal)
        if(newTotal>oldTotal){
          dispatch(incrementPoints(newTotal-oldTotal));
        }
        

        
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

  return (
    <div className="p-6 flex justify-between flex-col items-center gap-12 overflow-y-auto">
      <div className="relative flex w-full items-center justify-center">
        <div className="absolute flex left-10 border-2 w-20 h-20 rounded-full border justify-center items-center">
          <h1 className="font-bold text-2xl">{points}</h1>
        </div>
        <div onClick={()=>router.push("/rewards")} className="absolute flex left-40 border-2 p-4 rounded-lg justify-center items-center cursor-pointer transition duration-300 hover:text-white hover:bg-black">
          <h1 className="font-bold text-2xl">REDEEM</h1>
        </div>
        <div
          onClick={handleTaskAdd}
          className="flex flex-row bg-[#f0f39f69] w-fit p-4 rounded-lg border hover:opacity-50 transition-opacity duration-300 ease-in-out"
        >
          <Plus />
          <span> Add Task </span>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {tasks.map((task, index) => {
          return (
            <div key={index}>
              <TaskCard
                name={task.name}
                contentList={task.contentList}
                onDelete={() => setDeleteTaskConfimration(true)}
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
          );
        })}
      </div>
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
    </div>
  );
}
