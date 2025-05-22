import React, { useState } from "react";
import { gql, useMutation, useQuery } from "@apollo/client";

const inputClass = "w-full p-2 border border-gray-600 rounded bg-[#333333] text-white";

const ADD_PROJECT = gql`
  mutation AddProject($input: ProjectInput!) {
    addProject(input: $input) {
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
      }
    }
  }
`;

const GET_STUDENTS = gql`
  query GetStudents {
    students {
      username
    }
  }
`;

type AddProjectButtonProps = {
  onClose: () => void;
};

const AddProjectButton: React.FC<AddProjectButtonProps> = ({ onClose }) => {
  const [form, setForm] = useState({
    project_title: "",
    project_description: "",
    students_list: [] as string[],
    project_category: "",
    starting_date: "",
    ending_date: "",
    project_status: "",
  });

  const [addProject, { loading }] = useMutation(ADD_PROJECT);
  const { data: studentData, loading: studentLoading } = useQuery(GET_STUDENTS);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === "students_list") {
const selected = Array.from((e.target as HTMLSelectElement).selectedOptions, (opt) => opt.value);
      setForm({ ...form, students_list: selected });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = async () => {
    const required = [
      form.project_title,
      form.project_description,
      form.project_category,
      form.starting_date,
      form.ending_date,
      form.project_status,
    ];
    if (required.some((v) => !v.trim()) || form.students_list.length === 0) {
      alert("All fields are required.");
      return;
    }

    try {
      await addProject({ variables: { input: form } });
      alert("Project added successfully.");
      onClose();
    } catch (err) {
      console.error("Error adding project:", err);
      alert("Error adding project.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-[#1e1e1e] text-white p-6 rounded-lg w-[500px] h-screen overflow-y-auto relative" onClick={(e) => e.stopPropagation()}>
        <button className="absolute top-3 right-3 text-2xl text-gray-400 hover:text-red-500" onClick={onClose}>
          &times;
        </button>
        <h2 className="text-2xl font-semibold mb-6 pt-4">Add New Project</h2>
        <div className="space-y-5 pb-10">
          <input name="project_title" value={form.project_title} onChange={handleChange} placeholder="Title" className={inputClass} />
          <textarea name="project_description" value={form.project_description} onChange={handleChange} placeholder="Description" className={inputClass} rows={4} />
          <select name="students_list" multiple value={form.students_list} onChange={handleChange} className={inputClass}>
            <option value="">Select student(s)</option>
            {studentLoading ? (
              <option disabled>Loading...</option>
            ) : (
              studentData?.students?.map((s: any, i: number) => (
                <option key={i} value={s.username}>
                  {s.username}
                </option>
              ))
            )}
          </select>
          <select name="project_category" value={form.project_category} onChange={handleChange} className={inputClass}>
            <option value="">Select category</option>
            <option>Website Redesign</option>
            <option>Mobile App Development</option>
            <option>Data Analysis project</option>
            <option>Machine Learning Model</option>
          </select>
          <input type="date" name="starting_date" value={form.starting_date} onChange={handleChange} className={inputClass} />
          <input type="date" name="ending_date" value={form.ending_date} onChange={handleChange} className={inputClass} />
          <select name="project_status" value={form.project_status} onChange={handleChange} className={inputClass}>
            <option value="">Select status</option>
            <option>Pending</option>
            <option>In Progress</option>
            <option>Completed</option>
            <option>On Hold</option>
            <option>Cancelled</option>
          </select>
          <button className="w-full bg-green-600 py-2 rounded hover:bg-green-700" onClick={handleSubmit} disabled={loading}>
            {loading ? "Adding..." : "Add Project"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddProjectButton;
