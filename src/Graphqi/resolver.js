const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('./config');

const resolvers = {
  Query: {
    _empty: () => 'Server is running',

    getLastSignedInUserRole: async (_, __, { db }) => {
  try {
    const [results] = await db.promise().query(`
      SELECT u.role, u.username
      FROM signin s
      JOIN users u ON s.user_id = u.id
      ORDER BY s.signed_in_at DESC
      LIMIT 1
    `);
    if (!results || results.length === 0) return null;

    return {
      role: results[0].role.trim(),
      username: results[0].username.trim(),
    };
  } catch (error) {
    console.error('Error fetching last signed-in user role:', error);
    throw new Error('Failed to get user role');
  }
},


    dashboardStatistics: async (_, __, { db }) => {
      try {
        const [[projectRow]] = await db.promise().query('SELECT COUNT(*) AS projectCount FROM projects');
        const [[taskRow]] = await db.promise().query('SELECT COUNT(*) AS taskCount FROM tasks');
        const [[studentRow]] = await db.promise().query(`SELECT COUNT(*) AS studentCount FROM users WHERE role = 'student'`);
        const [[finishedRow]] = await db.promise().query(`SELECT COUNT(*) AS finishedProjectCount FROM projects WHERE project_status = 'Completed'`);

        return {
          projectCount: projectRow.projectCount,
          taskCount: taskRow.taskCount,
          studentCount: studentRow.studentCount,
          finishedProjectCount: finishedRow.finishedProjectCount,
        };
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        throw new Error('Failed to fetch dashboard statistics');
      }
    },

    students: async (_, __, { db }) => {
      try {
        const [results] = await db.promise().query(`SELECT DISTINCT username FROM users WHERE role = 'student'`);
        return results;
      } catch (error) {
        console.error("Failed to fetch student names:", error);
        throw new Error("Database error");
      }
    },

    projects: async (_, { search = '', status }, { db }) => {
      try {
        let query = 'SELECT * FROM projects WHERE 1=1';
        const params = [];

        if (search) {
          query += ' AND (project_title LIKE ? OR project_description LIKE ?)';
          params.push(`%${search}%`, `%${search}%`);
        }

        if (status && status !== 'all') {
          query += ' AND project_status = ?';
          params.push(status);
        }

        const [projects] = await db.promise().query(query, params);
        if (projects.length === 0) return [];

        for (const project of projects) {
          project.project_title = project.project_title.trim();
        }

        const projectTitles = projects.map(p => p.project_title);
        const [allTasks] = await db.promise().query(
          `SELECT * FROM tasks WHERE TRIM(projectTitle) IN (${projectTitles.map(() => '?').join(',')})`,
          projectTitles
        );

        const tasksByTitle = {};
        for (const task of allTasks) {
          const title = task.projectTitle?.trim();
          if (!tasksByTitle[title]) tasksByTitle[title] = [];
          tasksByTitle[title].push({
            id: task.taskId.toString(),
            taskId: task.taskId,
            taskName: task.taskName.trim(),
            projectTitle: task.projectTitle.trim(),
            description: task.description || '',
            assignedStudent: task.assignedStudent || '',
            status: task.status || 'Pending',
            dueDate: task.dueDate ? task.dueDate.toISOString().split('T')[0] : null,
          });
        }

        for (const project of projects) {
          project.tasks = tasksByTitle[project.project_title] || [];
          if (typeof project.students_list === 'string') {
            try {
              project.students_list = JSON.parse(project.students_list);
            } catch {
              project.students_list = project.students_list.split(',').map(s => s.trim());
            }
          }
        }

        return projects;
      } catch (error) {
        console.error('Error fetching projects:', error);
        throw new Error('Failed to fetch projects');
      }
    },

    project: async (_, { id }, { db }) => {
      try {
        const [projectResults] = await db.promise().query('SELECT * FROM projects WHERE id = ?', [id]);
        if (projectResults.length === 0) return null;

        const project = projectResults[0];
        project.project_title = project.project_title.trim();

        const [taskResults] = await db.promise().query(
          'SELECT * FROM tasks WHERE TRIM(projectTitle) = ?',
          [project.project_title]
        );

        const tasks = taskResults.map(task => ({
          id: task.taskId.toString(),
          taskId: task.taskId,
          taskName: task.taskName.trim(),
          projectTitle: task.projectTitle.trim(),
          description: task.description || '',
          assignedStudent: task.assignedStudent || '',
          status: task.status || 'Pending',
          dueDate: task.dueDate ? task.dueDate.toISOString().split('T')[0] : null,
        }));

        if (typeof project.students_list === 'string') {
          try {
            project.students_list = JSON.parse(project.students_list);
          } catch {
            project.students_list = project.students_list.split(',').map(s => s.trim());
          }
        }

        project.tasks = tasks;

        return project;
      } catch (error) {
        console.error('Error fetching project:', error);
        throw new Error('Failed to fetch project');
      }
    },

    tasks: async (_, { sortBy }, { db }) => {
      try {
        let query = `
          SELECT taskId, projectTitle, taskName, description,
                 assignedStudent, status, dueDate
          FROM tasks
        `;

        if (sortBy === "dueDate") query += " ORDER BY dueDate";
        else if (sortBy === "status") query += " ORDER BY status";
        else if (sortBy === "project") query += " ORDER BY projectTitle";
        else if (sortBy === "student") query += " ORDER BY assignedStudent";

        const [rows] = await db.promise().query(query);
        return rows;
      } catch (err) {
        console.error("❌ Failed to fetch tasks:", err);
        throw new Error("Error fetching tasks");
      }
    },

    getProjectTitles: async (_, __, { db }) => {
      try {
        const [rows] = await db.promise().query(`SELECT DISTINCT project_title FROM projects`);
        return rows.map(row => row.project_title.trim());
      } catch (err) {
        console.error("Error fetching project titles:", err);
        throw new Error("Failed to fetch project titles");
      }
    },
    sender: (_, __, { db }) => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT u.id, u.username, u.role, u.universityID
      FROM signin s
      JOIN users u ON s.user_id = u.id
      ORDER BY s.signed_in_at DESC
      LIMIT 1
    `;
    db.query(query, (err, results) => {
      if (err) {
        console.error("Failed to fetch sender:", err);
        return reject(new Error("Database error"));
      }
      if (results.length === 0) return resolve(null);

      // Normalize output: trim strings
      const user = results[0];
      resolve({
        id: user.id,
        username: user.username.trim(),
        role: user.role.trim(),
        universityID: user.universityID ? user.universityID.trim() : null,
      });
    });
  });
},



  studentProfile: async (_, __, { db }) => {
  try {
    const query = `
      SELECT u.id, u.username AS name, u.role, u.universityID
      FROM signin s
      JOIN users u ON s.user_id = u.id
      ORDER BY s.signed_in_at DESC
      LIMIT 1
    `;
    const [rows] = await db.promise().query(query);
    return rows[0] || null;
  } catch (err) {
    console.error('Error fetching student profile:', err);
    throw new Error('Failed to fetch student profile');
  }
},

studentTasksCount: async (_, __, { db }) => {
  try {
    const userQuery = `
      SELECT u.username
      FROM signin s
      JOIN users u ON s.user_id = u.id
      WHERE u.role = 'student'
      ORDER BY s.signed_in_at DESC
      LIMIT 1
    `;
    const [userRows] = await db.promise().query(userQuery);
    if (!userRows[0]) return 0;

    const username = userRows[0].username.trim(); // use username, not ID

    const countQuery = 'SELECT COUNT(*) as count FROM tasks WHERE assignedStudent = ?';
    const [countResult] = await db.promise().query(countQuery, [username]);

    return countResult[0].count;
  } catch (err) {
    console.error('Error counting student tasks:', err);
    throw new Error('Failed to count student tasks');
  }
},


studentProjectsCount: async (_, __, { db }) => {
  try {
    // Get current student id
    const userQuery = `
      SELECT u.id, u.username
      FROM signin s
      JOIN users u ON s.user_id = u.id
      WHERE u.role = 'student'
      ORDER BY s.signed_in_at DESC
      LIMIT 1
    `;
    const [userRows] = await db.promise().query(userQuery);
    if (!userRows[0]) return 0;
    const studentId = userRows[0].id;
    const username = userRows[0].username.trim();

    // If students_list stores usernames as JSON array, use JSON_CONTAINS:
    const countQuery = `
      SELECT COUNT(*) AS count
  FROM projects
  WHERE JSON_VALID(students_list) = 1
    AND JSON_CONTAINS(students_list, JSON_QUOTE(?))
    `;
    const [countResult] = await db.promise().query(countQuery, [username]);

    return countResult[0].count;
  } catch (err) {
    console.error('Error counting student projects:', err);
    throw new Error('Failed to count student projects');
  }
},
//Get a projects for a specific student
projectsForStudent: async (_, { search = '', status }, { db }) => {
  //alert('-------');
  try {
    const [users] = await db.promise().query(`
      SELECT u.username
      FROM signin s
      JOIN users u ON s.user_id = u.id
      WHERE u.role = 'student'
      ORDER BY s.signed_in_at DESC
      LIMIT 1
    `);

    if (!users.length) {
      throw new Error('No signed-in student found');
    }

    const studentUsername = users[0].username;

    // Step 2: Build query to get only projects with at least one task assigned to that student
    let query = `
      SELECT DISTINCT p.*
      FROM projects p
      JOIN tasks t ON TRIM(p.project_title) = TRIM(t.projectTitle)
      WHERE TRIM(t.assignedStudent) = ?
    `;

    const params = [studentUsername];

    if (search.trim() !== '') {
      query += ' AND (p.project_title LIKE ? OR p.project_description LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm);
    }

    if (status && status !== 'all') {
      query += ' AND p.project_status = ?';
      params.push(status);
    }

    const [projects] = await db.promise().query(query, params);
    if (!projects.length) return [];

    // Normalize titles
    for (const project of projects) {
      project.project_title = project.project_title.trim();
    }

    const projectTitles = projects.map(p => p.project_title);
    const [allTasks] = await db.promise().query(
      `SELECT * FROM tasks WHERE TRIM(projectTitle) IN (${projectTitles.map(() => '?').join(',')}) AND TRIM(assignedStudent) = ?`,
      [...projectTitles, studentUsername]
    );

    const tasksByTitle = {};
    for (const task of allTasks) {
      const title = task.projectTitle?.trim();
      if (!tasksByTitle[title]) tasksByTitle[title] = [];
      tasksByTitle[title].push({
        id: task.taskId.toString(),
        taskId: task.taskId,
        taskName: task.taskName.trim(),
        projectTitle: title,
        description: task.description || '',
        assignedStudent: task.assignedStudent || '',
        status: task.status || 'Pending',
        dueDate: task.dueDate ? task.dueDate.toISOString().split('T')[0] : null,
      });
    }

    for (const project of projects) {
      project.tasks = tasksByTitle[project.project_title] || [];

      if (typeof project.students_list === 'string') {
        try {
          project.students_list = JSON.parse(project.students_list);
        } catch {
          project.students_list = project.students_list.split(',').map(s => s.trim());
        }
      }
    }

    return projects;
  } catch (error) {
    console.error('Error fetching student projects:', error);
    throw new Error('Failed to fetch student-specific projects');
  }
},

//Get the datails of the project for a specific student
detailsofprojectsForStudent: async (_, { id }, { db }) => {
      try {
        const [projectResults] = await db.promise().query('SELECT * FROM projects WHERE id = ?', [id]);
        if (projectResults.length === 0) return null;

        const project = projectResults[0];
        project.project_title = project.project_title.trim();

        const [taskResults] = await db.promise().query(
          'SELECT * FROM tasks WHERE TRIM(projectTitle) = ?',
          [project.project_title]
        );

        const tasks = taskResults.map(task => ({
          id: task.taskId.toString(),
          taskId: task.taskId,
          taskName: task.taskName.trim(),
          projectTitle: task.projectTitle.trim(),
          description: task.description || '',
          assignedStudent: task.assignedStudent || '',
          status: task.status || 'Pending',
          dueDate: task.dueDate ? task.dueDate.toISOString().split('T')[0] : null,
        }));

        if (typeof project.students_list === 'string') {
          try {
            project.students_list = JSON.parse(project.students_list);
          } catch {
            project.students_list = project.students_list.split(',').map(s => s.trim());
          }
        }

        project.tasks = tasks;

        return project;
      } catch (error) {
        console.error('Error fetching project:', error);
        throw new Error('Failed to fetch project');
      }
    },

//get the tasks for a specific student
tasksforstudent : async (_, { sortBy }, { db }) => { 
  try {
    // Step 1: Get last signed-in student ID
    const [students] = await db.promise().query(`
      SELECT u.username 
      FROM signin s
      JOIN users u ON s.user_id = u.id
      WHERE u.role = 'student'
      ORDER BY s.signed_in_at DESC
      LIMIT 1
    `);

    if (students.length === 0) {
      throw new Error("No signed-in student found");
    }

    const assignedStudent = students[0].username;

    // Step 2: Get tasks for that student
    let query = `
      SELECT taskId, projectTitle, taskName, description,
             assignedStudent, status, dueDate
      FROM tasks
      WHERE assignedStudent = ?
    `;

    if (sortBy === "dueDate") query += " ORDER BY dueDate";
    else if (sortBy === "status") query += " ORDER BY status";
    else if (sortBy === "project") query += " ORDER BY projectTitle";

    const [tasks] = await db.promise().query(query, [assignedStudent]);
    return tasks;

  } catch (err) {
    console.error("❌ Failed to fetch tasks for last signed-in student:", err);
    throw new Error("Error fetching tasks for last signed-in student");
  }
},
 Admins: async (_, __, { db }) => {
      try {
        const [results] = await db.promise().query(`SELECT DISTINCT username FROM users WHERE role = 'admin'`);
        return results;
      } catch (error) {
        console.error("Failed to fetch student names:", error);
        throw new Error("Database error");
      }
    }



  },

  Mutation: {
    signin: async (_, { username, password }, { db }) => {
      try {
        if (!username?.trim() || !password?.trim()) {
          throw new Error('Username and password are required');
        }

        const [rows] = await db.promise().query(
          'SELECT id, username, password, role, universityID FROM users WHERE username = ?',
          [username.trim()]
        );

        if (rows.length === 0) throw new Error('Invalid credentials');

        const user = rows[0];
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) throw new Error('Invalid credentials');

        const token = jwt.sign(
          { id: user.id, username: user.username, role: user.role },
          JWT_SECRET,
          { expiresIn: '1d' }
        );

        await db.promise().query(
          'INSERT INTO signin (user_id, signed_in_at) VALUES (?, NOW())',
          [user.id]
        );

        return {
          token,
          user: {
            id: user.id,
            username: user.username,
            role: user.role,
            universityID: user.universityID,
          },
          message: 'Login successful',
        };
      } catch (error) {
        console.error('Signin error:', error);
        throw new Error(error.message || 'Login failed');
      }
    },

    signup: async (_, { input }, { db }) => {
      try {
        const { username, password, role, universityID } = input;

        if (!username?.trim() || !password?.trim() || !role?.trim()) {
          throw new Error('Username, password and role are required');
        }

        if (role === 'student' && !universityID?.trim()) {
          throw new Error('University ID is required for students');
        }

        const [existingUsers] = await db.promise().query(
          'SELECT id FROM users WHERE username = ?',
          [username.trim()]
        );

        if (existingUsers.length > 0) {
          throw new Error('Username already exists');
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const [result] = await db.promise().query(
          'INSERT INTO users (username, password, role, universityID) VALUES (?, ?, ?, ?)',
          [username.trim(), hashedPassword, role.trim(), universityID?.trim() || null]
        );

        const token = jwt.sign(
          { id: result.insertId, username, role },
          JWT_SECRET,
          { expiresIn: '1d' }
        );

        return {
          token,
          user: {
            id: result.insertId,
            username,
            role,
            universityID: universityID || null,
          },
          message: 'Signup successful',
        };
      } catch (error) {
        console.error('Signup error:', error);
        throw new Error(error.message || 'Signup failed');
      }
    },

    addProject: async (_, { input }, { db }) => {
      try {
        const {
          project_title,
          project_description,
          students_list,
          project_category,
          starting_date,
          ending_date,
          project_status,
        } = input;

        if (
          !project_title?.trim() ||
          !project_description?.trim() ||
          !Array.isArray(students_list) ||
          students_list.length === 0 ||
          !project_category?.trim() ||
          !starting_date ||
          !ending_date ||
          !project_status?.trim()
        ) {
          throw new Error("All fields are required");
        }

        const normalizedStudentsList = JSON.stringify(students_list);

        const query = `
          INSERT INTO projects 
          (project_title, project_description, students_list, project_category, starting_date, ending_date, project_status)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `;

        const [result] = await db.promise().query(query, [
          project_title.trim(),
          project_description.trim(),
          normalizedStudentsList,
          project_category.trim(),
          starting_date,
          ending_date,
          project_status.trim(),
        ]);

        return {
          id: result.insertId,
          project_title,
          project_description,
          students_list,
          project_category,
          starting_date,
          ending_date,
          project_status,
          tasks: [],
        };
      } catch (error) {
        console.error("❌ Error adding project:", error);
        throw new Error(error.message || "Failed to add project");
      }
    },

    addTask: async (_, { input }, { db }) => {
  const {
    projectTitle,
    taskName,
    description,
    assignedStudent,
    status,
    dueDate
  } = input;

  if (
    !projectTitle?.trim() ||
    !taskName?.trim() ||
    !description?.trim() ||
    !assignedStudent?.trim() ||
    !status?.trim() ||
    !dueDate?.trim()
  ) {
    throw new Error("All task fields are required");
  }

  try {
    // Insert into DB (example)
    const [result] = await db.promise().query(
  `INSERT INTO tasks (projectTitle, taskName, description, assignedStudent, status, dueDate)
   VALUES (?, ?, ?, ?, ?, ?)`,
  [projectTitle, taskName, description, assignedStudent, status, dueDate]
);


    return {
      id: result.insertId,
      taskId: `TASK-${result.insertId}`,
      taskName,
      projectTitle,
      description,
      assignedStudent,
      status,
      dueDate
    };
  } catch (err) {
    console.error("DB error while adding task:", err);
    throw new Error("Failed to add task");
  }
},

   sendMessage: (_, { input }, { db }) => {
      const { sender, receiver, content } = input;
      if (!sender || !receiver || !content) {
        return {
          success: false,
          message: "Please fill in all fields.",
          id: null,
        };
      }

      return new Promise((resolve) => {
        const query = `
          INSERT INTO messages (sender, reciever, content)
          VALUES (?, ?, ?)
        `;
        db.query(query, [sender, receiver, content], (err, result) => {
          if (err) {
            console.error("Database error:", {
              code: err.code,
              sqlMessage: err.sqlMessage,
              sql: err.sql,
            });
            return resolve({
              success: false,
              message: "Failed to send message",
              id: null,
            });
          }
          resolve({
            success: true,
            message: "Message sent successfully",
            id: result.insertId,
          });
        });
      });
    },









  }
};

module.exports = resolvers;
