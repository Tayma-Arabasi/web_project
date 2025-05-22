import React from 'react';

interface SidebarProps {
  currentPage: 'home' | 'projects' | 'tasks' | 'chat';
  onPageChange: (page: 'home' | 'projects' | 'tasks' | 'chat') => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentPage, onPageChange }) => {
  const buttons = [
    { label: 'Home', value: 'home' },
    { label: 'Projects', value: 'projects' },
    { label: 'Tasks', value: 'tasks' },
    { label: 'Chat', value: 'chat' },
  ];

  return (
    <div className="bg-gradient-to-b from-[#1e1e1e] to-[#303030] w-64 p-5 flex flex-col">
      {buttons.map(({ label, value }) => (
        <button
          key={value}
          onClick={() => onPageChange(value as SidebarProps['currentPage'])}
          className={`py-2 px-4 mb-4 rounded focus:outline-none transition-all
            ${currentPage === value ? 'bg-[#027bff]' : 'bg-[#444444] hover:bg-[#555]'}`}
        >
          {label}
        </button>
      ))}
    </div>
  );
};

export default Sidebar;
