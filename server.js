const { ApolloServer } = require('apollo-server-express');
const express = require('express');
const typeDefs = require('./src/Graphqi/schema');
const resolvers = require('./src/Graphqi/resolver');
const db = require('./src/Graphqi/db');

const app = express();

// Debug route - CORRECTED VERSION
app.get('/debug-user/:username', async (req, res) => {
  const { username } = req.params; // Now matches the route parameter
  console.log(`Debugging user: ${username}`);
  
  try {
    const [rows] = await db.promise().query(
      'SELECT id, username, password, role, universityID FROM users WHERE username = ?', 
      [username]
    );
    
    console.log('Query results:', rows);
    res.json({
      userFound: rows.length > 0,
      user: rows.length > 0 ? rows[0] : null,
      // Don't return password hash in production!
      passwordHash: rows.length > 0 ? rows[0].password : null 
    });
    
  } catch (err) {
    console.error('Debug route error:', err);
    res.status(500).json({ 
      error: err.message,
      details: 'Check server logs for more information' 
    });
  }
});

// Password verification debug endpoint
app.post('/verify-password', express.json(), async (req, res) => {
  const { password, hash } = req.body;
  try {
    const bcrypt = require('bcrypt');
    const match = await bcrypt.compare(password, hash);
    res.json({ match });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req }) => ({ db, req })
});

async function startServer() {
  await server.start();
  server.applyMiddleware({ app });

  app.listen({ port: 5000 }, () => {
    console.log(`Server ready at http://localhost:5000${server.graphqlPath}`);
    console.log(`Debug routes:
      GET http://localhost:5000/debug-user/:username
      POST http://localhost:5000/verify-password
        Body: { "password": "test123", "hash": "$2b$10$..." }`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
});