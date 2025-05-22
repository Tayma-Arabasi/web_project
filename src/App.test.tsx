import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { App } from './App';

test('navigates between views using the sidebar', () => {
  render(<App />);

  // Check home page default
  expect(screen.getByText(/Welcome to the Task Management System/i)).toBeInTheDocument();

  // Click Projects button
  fireEvent.click(screen.getByText('Projects'));
  expect(screen.getByText(/Projects Overview/i)).toBeInTheDocument();

  // Click Tasks button
  fireEvent.click(screen.getByText('Tasks'));
  expect(screen.getByText(/Create a new task/i)).toBeInTheDocument();

  // Click Chat button
  fireEvent.click(screen.getByText('Chat'));
  expect(screen.getByText(/List of Students/i)).toBeInTheDocument();
});
