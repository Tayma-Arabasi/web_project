import React, { useState } from "react";
import { useQuery, useMutation, gql } from "@apollo/client";

// Queries
const GET_PROJECT_TITLES = gql`
  query {
    getProjectTitles
  }
`;

const GET_STUDENTS = gql`
  query GetStudents {
    students {
      username
    }
  }
`;

// Mutation using TaskInput
const ADD_TASK = gql`
  mutation AddTask($input: TaskInput!) {
    addTask(input: $input) {
      id
      taskId
    }
  }
`;

const CreateNewTask = ({ onClose }) => {
  const [projectTitle, setProjectTitle] = useState("");
  const [taskName, setTaskName] = useState("");
  const [description, setDescription] = useState("");
  const [assignedStudent, setAssignedStudent] = useState("");
  const [status, setStatus] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [error, setError] = useState("");

  const { data: projectData } = useQuery(GET_PROJECT_TITLES);
  const { data: studentData } = useQuery(GET_STUDENTS);
  const [addTask, { loading }] = useMutation(ADD_TASK);
console.log({
  projectTitle,
  taskName,
  description,
  assignedStudent,
  status,
  dueDate,
});

  const onAddTask = async () => {
    if (
      !projectTitle.trim() ||
      !taskName.trim() ||
      !description.trim() ||
      !assignedStudent.trim() ||
      !status.trim() ||
      !dueDate.trim()
    ) {
      setError("Please fill in all fields.");
      alert("You are missing some fields.");
      return;
    }

    setError("");

    try {
      const { data } = await addTask({
        variables: {
          input: {
            projectTitle,
            taskName,
            description,
            assignedStudent,
            status,
            dueDate,
          },
        },
      });

      alert("Task added successfully!");

      // Reset form
      setProjectTitle("");
      setTaskName("");
      setDescription("");
      setAssignedStudent("");
      setStatus("");
      setDueDate("");

      onClose();
    } catch (err) {
      console.error("Error adding task:", err);
      setError(err.message || "Something went wrong");
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-[#1e1e1e] text-white p-6 rounded-lg w-[500px] h-screen overflow-y-auto relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="absolute top-3 right-3 text-2xl text-gray-400 hover:text-red-500"
          onClick={onClose}
        >
          &times;
        </button>

        <h2 className="text-2xl font-semibold mb-6 pt-4">Create New Task</h2>

        <div className="space-y-5 pb-10">
          <div>
            <label className="block font-medium">Project Title:</label>
            <select
              value={projectTitle}
              onChange={(e) => setProjectTitle(e.target.value)}
              className="w-full p-2 border border-gray-600 rounded bg-[#333333] text-white"
            >
              <option value="">Select a project</option>
              {projectData?.getProjectTitles?.map((title, idx) => (
                <option key={idx} value={title}>
                  {title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-medium">Task Name:</label>
            <input
              type="text"
              value={taskName}
              onChange={(e) => setTaskName(e.target.value)}
              className="w-full p-2 border border-gray-600 rounded bg-[#333333] text-white"
            />
          </div>

          <div>
            <label className="block font-medium">Description:</label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-2 border border-gray-600 rounded bg-[#333333] text-white"
            />
          </div>

          <div>
            <label className="block font-medium">Assigned Student:</label>
            <select
              value={assignedStudent}
              onChange={(e) => setAssignedStudent(e.target.value)}
              className="w-full p-2 border border-gray-600 rounded bg-[#333333] text-white"
            >
              <option value="">Select a student</option>
              {studentData?.students?.map((student, idx) => (
                <option key={idx} value={student.username}>
                  {student.username}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-medium">Status:</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full p-2 border border-gray-600 rounded bg-[#333333] text-white"
            >
              <option value="">Select a status</option>
              <option>In Progress</option>
              <option>Completed</option>
              <option>Pending</option>
              <option>On Hold</option>
              <option>Cancelled</option>
            </select>
          </div>

          <div>
            <label className="block font-medium">Due Date:</label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full p-2 border border-gray-600 rounded bg-[#333333] text-white"
            />
          </div>

          <button
            className="w-full bg-[#4caf50] text-white py-2 rounded hover:bg-green-600"
            onClick={onAddTask}
            disabled={loading}
          >
            {loading ? "Adding..." : "Add Task"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateNewTask;
