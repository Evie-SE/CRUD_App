const express = require('express');
const app = express();
const port = 3000;
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./openapi.json');
const path = require('path');
require('dotenv').config();
//declare the database connection
const { Pool } = require('pg');

//connecting to the database
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

app.use(express.json());


async function initDB() {
    try {
        await pool.query(`
           CREATE TABLE IF NOT EXISTS tasks (
           id SERIAL PRIMARY KEY,
           title TEXT NOT NULL,
           done BOOLEAN DEFAULT FALSE
           ); 
        `)

        const res = await pool.query('SELECT COUNT(*) FROM tasks');
        if(parseInt(res.rows[0].count) === 0) {
            await pool.query(`
                INSERT INTO tasks (title, done) VALUES
                ('First Task', false),
                ('Second Task', false),
                ('Third Task', false)
            `);
            console.log('Seeded initial task!');
        }
        console.log('Database connected & initialized successfully');
    } catch (err) {
        console.log('Error setting up database: ', err);
    }
}

initDB();

app.use(express.json());

const formatTask = (task) => ({
    ...task,
    done: Boolean(task.done)
});

app.get('/', (req, res) => {
    res.json( {
        name: "Task API",
        version: "1.0",
        endpoints: ['/tasks', '/task/:id']
    });
});

app.get('/health', (req, res) =>  {
    res.json ( {
        status: "OK"
    })
});

app.get('/tasks', async (req, res) => {
    const { done, search } = req.query;
    let conditions = [];
    let params = [];

    if (search) {
        params.push(`%${search.trim()}%`);
        conditions.push(`title LIKE $${params.length}`);
    }

    if (done !== undefined) {
       params.push(done === 'true');
       conditions.push(`done = $${params.length}`)
    }

    let query = 'SELECT * FROM tasks';
    if (conditions.length > 0) {
        query += ' WHERE ' + conditions.join(' AND ');
    }

    const {rows} = await pool.query(query, params);
    res.json(rows.map(formatTask));
});

/*const tasks = db.prepare('SELECT * FROM tasks').all();
    //res.json(tasks);

    const formattedTasks = tasks.map(formatTask);

    res.json(formattedTasks); */

app.get('/tasks/:id', async (req, res) => {
    const taskID = Number(req.params.id);
    const {rows} = await pool.query('SELECT * FROM tasks WHERE id = $1', [taskID]);
    const task = rows[0];

    if (!task) {
        return res.status(404).json({error: `Task ${taskID} not found`});
    }
    res.json(formatTask(task));
});


app.post('/tasks', async (req, res) => {
   const {title, done} = req.body;

    if(!title || typeof title !== "string" || title.trim() === '') {
        return res.status(400).json ({error: "Title is required"});
    }

   if (typeof done !== "boolean") {
        return res.status(400).json({error: "Done must be a boolean"});
   }

   const query = 'INSERT INTO tasks (title, done) VALUES ($1, $2)';
   const values = [title.trim(), done];
   const result = await pool.query(query, values);
   
   const newTask = result.rows[0];

   return res.status(201).json(newTask);
    }
);

app.put ('/tasks/:id', async (req, res) => {
    const taskID = parseInt(req.params.id, 10);
    const {title, done} = req.body;

    const existingTask = await pool.query('SELECT * FROM tasks WHERE id = $1', [taskID]);

    if(!title || typeof title !== 'string' || title.trim() === '') {
        return res.status(400).json({ error: "Title is required"});
    }
    if(existingTask.rows.length === 0) {
        return res.status(404).json({error: `Task ${taskID} not found`});
    }
   
    if(title === undefined && done === undefined) {
        return res.status(400).json({error: "No fields to update"});
    }
    
    
    if(typeof done !== "boolean") {
            return res.status(400).json({error: "Done must be a boolean"});
        } 

    const query = 'UPDATE tasks SET title = $1, done = $2 WHERE id = $3 RETURNING *';
    const values = [title.trim(), done, taskID];

    const result = await pool.query(query, values);

    if(result.rows.length === 0) {
        return res.status(404).json({ error: "Task not found"});
    }

    const updatedTask = result.rows[0];
    return res.status(200).json(updatedTask);
});

app.delete ('/tasks/:id', async (req, res) => {
    const taskID = parseInt(req.params.id, 10);
    const existingTask = await pool.query('SELECT * FROM tasks WHERE id = $1', [taskID]);
    if(!existingTask) {
        return res.status(404).json({error: `Task ${taskID} not found`});
    }

    await pool.query('DELETE FROM tasks WHERE id = $1', [taskID]);
    return res.status(204).send();
});

app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});

