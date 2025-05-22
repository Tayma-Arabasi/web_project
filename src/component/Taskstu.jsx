import React, { useState } from 'react';
import { gql, useQuery } from '@apollo/client';

const GET_TASKS = gql`
  query GetTasks($sortBy: String) {
    tasksforstudent(sortBy: $sortBy) {
      taskId
      projectTitle
      taskName
      description
      assignedStudent
      status
      dueDate
    }
  }
`;

const TaskSection = () => {
  const [showTaskSection, setShowTaskSection] = useState(true);
  const [sortBy, setSortBy] = useState('status');
  const [showCreateModal, setShowCreateModal] = useState(false);

  const { data, loading, error, refetch } = useQuery(GET_TASKS, {
    variables: { sortBy },
    fetchPolicy: 'cache-and-network',
  });

  const handleSortChange = (e) => {
    const newSort = e.target.value;
    setSortBy(newSort);
    refetch({ sortBy: newSort });
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'N/A';
    return `${String(date.getDate()).padStart(2, '0')}-${String(
      date.getMonth() + 1
    ).padStart(2, '0')}-${date.getFullYear()}`;
  };

  return (
    <div className="content" id="task" style={{ display: showTaskSection ? 'block' : 'none' }}>
      <label className="px-3 font-semibold">Sort By:</label>
      <select
        value={sortBy}
        onChange={handleSortChange}
        className="bg-[#333] border border-[#444] text-white rounded h-[30pt] w-[100px] text-[15px] px-2"
      >
        <option value="status">Task Status</option>
        <option value="project">Project</option>
        <option value="dueDate">Due Date</option>
        <option value="student">Assigned Student</option>
      </select>

      <table className="w-full mt-4 text-left text-white border-collapse">
        <thead>
          <tr className="bg-gray-700">
            <th>Task ID</th>
            <th>Project</th>
            <th>Task Name</th>
            <th>Description</th>
            <th>Assigned Student</th>
            <th>Status</th>
            <th>Due Date</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan="7" className="text-center p-4 text-gray-400">
                Loading...
              </td>
            </tr>
          ) : error ? (
            <tr>
              <td colSpan="7" className="text-center p-4 text-red-400">
                Error loading tasks.
              </td>
            </tr>
          ) : data?.tasksforstudent?.length === 0 ? (
            <tr>
              <td colSpan="7" className="text-center p-4 text-gray-400">
                No tasks available.
              </td>
            </tr>
          ) : (
            data.tasksforstudent.map((task) => (
              <tr key={task.taskId} className="hover:bg-gray-800">
                <td className="p-2 border border-gray-600">{task.taskId}</td>
                <td className="p-2 border border-gray-600">{task.projectTitle}</td>
                <td className="p-2 border border-gray-600">{task.taskName}</td>
                <td className="p-2 border border-gray-600">{task.description}</td>
                <td className="p-2 border border-gray-600">{task.assignedStudent}</td>
                <td className="p-2 border border-gray-600">{task.status}</td>
                <td className="p-2 border border-gray-600">{formatDate(new Date(Number(task.dueDate)).toISOString())}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default TaskSection;
