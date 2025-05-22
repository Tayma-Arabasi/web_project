const { gql } = require('apollo-server-express');

const typeDefs = gql`
  scalar DateTime

  type User {
    id: ID!
    username: String!
    role: String!
    universityID: String
  }

  type UserRole {
    role: String!
    username: String!
  }

  type AuthPayload {
    token: String!
    user: User!
    message: String!
  }

  input SignUpInput {
    username: String!
    password: String!
    role: String!
    universityID: String
  }

  input ProjectInput {
    projectTitle: String!
    projectDescription: String!
    studentsList: [String!]!
    projectCategory: String!
    startingDate: DateTime!
    endingDate: DateTime!
    projectStatus: String!
  }

  input TaskInput {
    projectTitle: String!
    taskName: String!
    description: String!
    assignedStudent: String!
    status: String!
    dueDate: DateTime!
  }

  type DashboardStatistics {
    projectCount: Int!
    taskCount: Int!
    studentCount: Int!
    finishedProjectCount: Int!
  }

  type Task {
    id: ID!
    taskId: String!
    taskName: String!
    projectTitle: String!
    description: String!
    assignedStudent: String!
    status: String!
    dueDate: DateTime
  }

  type Project {
    id: ID!
    projectTitle: String!
    projectDescription: String!
    studentsList: [String!]!
    projectCategory: String!
    startingDate: DateTime!
    endingDate: DateTime!
    projectStatus: String!
    tasks: [Task!]!
  }

  type Message {
    id: ID!
    sender: String!
    receiver: String!
    content: String!
    timestamp: DateTime!
  }

  input SendMessageInput {
    sender: String!
    receiver: String!
    content: String!
  }

  type SendMessageResponse {
    success: Boolean!
    message: String!
    id: ID
  }

  type Query {
    _empty: String
    getLastSignedInUserRole: UserRole
    dashboardStatistics: DashboardStatistics

    projects(search: String, status: String): [Project!]!
    project(id: ID!): Project

    students: [User!]!
    admins: [User!]!

    tasks(sortBy: String): [Task!]!

    getProjectTitles: [String!]!

    # Student dashboard queries
    studentProfile: User
    studentTasksCount: Int
    studentProjectsCount: Int

    # Chat related queries
    sender: User
    messages(sender: String!, receiver: String!): [Message!]!

    projectsForStudent(search: String, status: String): [Project]
    projectDetailsForStudent(id: ID!): Project
    tasksForStudent(sortBy: String): [Task!]!
  }

  type Mutation {
    signin(username: String!, password: String!): AuthPayload!
    signup(input: SignUpInput!): AuthPayload!

    addProject(input: ProjectInput!): Project!
    addTask(input: TaskInput!): Task!

    sendMessage(input: SendMessageInput!): SendMessageResponse!
  }
`;

module.exports = typeDefs;
