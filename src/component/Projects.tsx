import React, { useState, useEffect } from 'react';
import AddProjectButton from './AddProjectButton';

interface project {
  id: number;
  project_title: string;
  project_description: string;
  students_list: string;
  project_category: string;
  starting_date: string;
  ending_date: string;
  project_status: string;
}

interface Task {
  taskId: number;
  taskName: string;
  projectTitle: string;
  description: string;
  assignedStudent: string;
  status: string;
  dueDate: string;
  id: number;
}

const FETCH_PROJECTS_QUERY = `
  query GetProjects($search: String, $status: String) {
    projects(search: $search, status: $status) {
      id
      project_title
      project_description
      students_list
      project_category
      starting_date
      ending_date
      project_status
    }
  }
`;

const FETCH_PROJECT_DETAILS_QUERY = `
  query GetProjectDetails($id: ID!) {
    project(id: $id) {
      id
      project_title
      project_description
      students_list
      project_category
      starting_date
      ending_date
      project_status
      tasks {
        id
        taskId
        taskName
        description
        assignedStudent
        status
        dueDate
      }
    }
  }
`;

export default function ProjectsSection() {
  const [showModal, setShowModal] = useState(false);
  const [status, setStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [projects, setProjects] = useState<project[]>([]);
  const [selectedProject, setSelectedProject] = useState<project | null>(null);
  const [projectTasks, setProjectTasks] = useState<Task[]>([]);
  const [showDetails, setShowDetails] = useState(false);

  const toggleModal = () => setShowModal(!showModal);

  useEffect(() => {
   const fetchProjects = async () => {
  try {
    const res = await fetch('http://localhost:5000/graphql', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: FETCH_PROJECTS_QUERY,
        variables: {
          search: searchQuery,
          status: status === 'all' ? null : status,
        },
      }),
    });

    const json = await res.json();
    console.log("GraphQL response:", json);

    if (json.errors) {
      console.error("GraphQL Error(s):", json.errors);
      return;
    }

   if (!json.data || !json.data.projects) {
  console.error("projects not found in response:", json);
  return;
}


setProjects(json.data.projects);
  } catch (err) {
    console.error('GraphQL fetch failed:', err);
  }
};


    fetchProjects();
  }, [searchQuery, status]);

  const showProjectDetails = async (projectId: number) => {
    try {
      const res = await fetch('http://localhost:5000/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: FETCH_PROJECT_DETAILS_QUERY,
variables: { id: String(projectId) }
        }),
      });
      const json = await res.json();
     const { project } = json.data;
console.log('Raw GraphQL response:', json);

if (!project) {
  console.error('Project not found');
  setSelectedProject(null);
  setProjectTasks([]);
  setShowDetails(false);
  return;
}

setSelectedProject(project);
console.log("Project Details:", project);
setProjectTasks(project.tasks || []);
setShowDetails(true);

    } catch (error) {
      console.error('Error fetching project details:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'in progress':
        return 'border-yellow-500';
      case 'completed':
        return 'border-green-600';
      case 'pending':
        return 'border-blue-500';
      case 'on hold':
        return 'border-orange-500';
      case 'cancelled':
        return 'border-red-600';
      default:
        return 'border-gray-500';
    }
  };

  const formatDate = (dateString: string) => {
  if (!dateString) return 'N/A'; // إذا القيمة فارغة أو null
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'N/A'; // إذا التاريخ غير صالح
  return `${String(date.getDate()).padStart(2, '0')}-${String(
    date.getMonth() + 1
  ).padStart(2, '0')}-${date.getFullYear()}`;
};


  return (
    <div className="w-full px-5 py-4 text-white" id="Projects">
      <h2 className="text-[#007bff] text-2xl font-bold mb-5">Projects Overview</h2>

      {/* Top Bar */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <button
          onClick={toggleModal}
          className="bg-[#007bff] text-white px-4 py-2 rounded-lg"
        >
          Add New Project
        </button>
        <input
          type="text"
          className="flex-grow max-w-[700px] px-4 py-2 rounded-lg text-black border border-gray-700"
          placeholder="Search projects by title or description..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="w-[140px] px-3 py-2 rounded-lg text-black border border-gray-700"
        >
          <option value="all">All Statuses</option>
          <option value="In Progress">In Progress</option>
          <option value="Completed">Completed</option>
          <option value="Pending">Pending</option>
          <option value="On Hold">On Hold</option>
          <option value="Cancelled">Cancelled</option>
        </select>
      </div>

      {/* Projects Grid */}
      <div className="flex flex-wrap justify-center gap-4 px-4">
        {projects.length > 0 ? (
          projects.map((project) => (
            <div
              key={project.id}
              className={`bg-[#292929] border-2 ${getStatusColor(
                project.project_status
              )} p-4 w-[260px] h-[260px] rounded-lg cursor-pointer hover:scale-105 transition-transform`}
              onClick={() => showProjectDetails(project.id)}
            >
              <h3 className="text-[#007bff] mb-2">{project.project_title}</h3>
              <p className="text-sm text-gray-300 mb-1">
                <strong>Description:</strong> {project.project_description}
              </p>
              <p className="text-sm text-gray-300 mb-1">
                <strong>Students:</strong> {project.students_list}
              </p>
              <p className="text-sm text-gray-300 mb-1">
                <strong>Category:</strong> {project.project_category}
              </p>
              <div className="bg-[#555] h-2 rounded mb-3">
                <div className="bg-[#007bff] h-2 w-1/2 rounded"></div>
              </div>
              <div className="flex justify-between text-xs text-gray-400 mt-3">
                <span>
<strong>Start:</strong> {formatDate(new Date(Number(project.starting_date)).toISOString())}
                </span>
                <span>
<strong>End:</strong> {formatDate(new Date(Number(project.ending_date)).toISOString())}
                </span>
              </div>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-400">No projects found.</p>
        )}
      </div>

      {/* Project Details Modal */}
      {showDetails && selectedProject && (
        <div className="fixed inset-0 bg-black bg-opacity-80 z-50 flex justify-end">
          <div className="w-[400px] h-full bg-[#111] text-white overflow-y-auto p-6 relative shadow-xl border-l border-gray-700">
            <button
              onClick={() => setShowDetails(false)}
              className="absolute top-4 right-4 text-white font-bold text-2xl hover:text-red-500"
            >
              &times;
            </button>

            <h2 className="text-2xl font-bold text-cyan-400 mb-4">
              {selectedProject.project_title}
            </h2>
            <p><strong>Description:</strong> {selectedProject.project_description}</p>
            <p><strong>Category:</strong> {selectedProject.project_category}</p>
            <p><strong>Students:</strong> {selectedProject.students_list}</p>
            <p><strong>Start Date:</strong> {formatDate(new Date(Number(selectedProject.starting_date)).toISOString())}</p>
            <p><strong>End Date:</strong> {formatDate(new Date(Number(selectedProject.ending_date)).toISOString())}</p>
            
            <h3 className="mt-6 mb-2 font-bold text-lg text-cyan-300">Tasks</h3>
            {projectTasks.length > 0 ? (
              projectTasks.map((task) => (
                <div key={task.id} className="border border-cyan-700 p-4 rounded-lg mb-4 bg-[#222]">
                  <p><strong>Task ID:</strong> {task.taskId}</p>
                  <p><strong>Task Name:</strong> {task.taskName}</p>
                  <p><strong>Description:</strong> {task.description}</p>
                  <p><strong>Assigned Student:</strong> {task.assignedStudent}</p>
                  <p><strong>Status:</strong> {task.status}</p>
                  <p><strong>Due Date:</strong> {task.dueDate ? task.dueDate.split('T')[0] : 'N/A'}</p>
                </div>
              ))
            ) : (
              <p>No tasks available for this project.</p>
            )}
          </div>
        </div>
      )}

      {/* Add Project Modal */}
      {showModal && <AddProjectButton onClose={toggleModal} />}
    </div>
  );
}
