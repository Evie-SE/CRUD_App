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
/*
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

app.get('/tasks', (req, res) => {
    const { done, search } = req.query;
    let conditions = [];
    let params = [];

    if (search) {
        conditions.push('title LIKE ?');
        params.push(`%${search.trim()}%`);
    }

    if (done !== undefined) {
        const isDone = done === 'true' ? 1 : 0;
        conditions.push('done = ?');
        params.push(isDone);
    }

    let query = 'SELECT * FROM tasks';
    if (conditions.length > 0) {
        query += ' WHERE ' + conditions.join(' AND ');
    }

    const tasks = db.prepare(query).all(...params);
    res.json(tasks.map(formatTask));
});

/*const tasks = db.prepare('SELECT * FROM tasks').all();
    //res.json(tasks);

    const formattedTasks = tasks.map(formatTask);

    res.json(formattedTasks); */
/*
app.get('/tasks/:id', (req, res) => {
    const taskID = Number(req.params.id);
    const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(taskID);
    if (!task) {
        return res.status(404).json({error: `Task ${taskID} not found`});
    }
    res.json(formatTask(task));
});

app.post('/tasks', (req, res) => {
   const {title, done} = req.body;
    if(!title || typeof title !== "string" || title.trim() === '') {
        return res.status(400).json ({error: "Title is required"});
    }

   if (typeof done !== "boolean") {
        return res.status(400).json({error: "Done must be a boolean"});
   }

   const isDone = done ? 1 : 0;
   const insert = db.prepare('INSERT INTO tasks (title, done) VALUES (?, ?)')
   const result = insert.run(title.trim(), isDone);
   const newTask = db.prepare('SELECT * FROM tasks WHERE id = ?').get(result.lastInsertRowid);

   return res.status(201).json(newTask);
    }
);

app.put ('/tasks/:id', (req, res) => {
    const taskID = parseInt(req.params.id, 10);
    const {title, done} = req.body;

    const existingTask = db.prepare('SELECT * FROM tasks WHERE id = ?').get(taskID);

    if(!existingTask) {
        return res.status(404).json({error: `Task ${taskID} not found`});
    }
   
    if(title === undefined && done === undefined) {
        return res.status(400).json({error: "No fields to update"});
    }

    /* if(title !== undefined) {
        if(typeof title !== "string" || title.trim() === '') {
            return res.status(400).json({error: "Title must be a non-empty string"});
        }
        task.title = title.trim();
    }
    
    if(done !== undefined) {
        if(typeof done !== "boolean") {
            return res.status(400).json({error: "Done must be a boolean"});
        }
        task.done = done;
    }
    */
/*
    let updatedTitle = existingTask.title;
    if(title !== undefined) {
        if(typeof title !== "string" || title.trim() === "") {
            return res.status(400).json({error: "Title must a non-empty string"});
        }
        updatedTitle = title.trim();
    }

    let updatedDone = existingTask.done;
    if (done !== undefined) {
        if(typeof done !== "boolean") {
            return res.status(400).json({ error: "Done must be a boolean" });
        }
        updatedDone = done ? 1 : 0;
    }
    const update = db.prepare('UPDATE tasks SET title = ?, done = ? WHERE id = ?');
    const result = update.run(updatedTitle, updatedDone, taskID);

    const updatedTask = db.prepare('SELECT * FROM tasks WHERE id = ?').get(taskID);
    return res.json(formatTask(updatedTask));
});

app.delete ('/tasks/:id', (req, res) => {
    const taskID = parseInt(req.params.id, 10);
    const existingTask = db.prepare('SELECT * FROM tasks WHERE id = ?').get(taskID);
    if(!existingTask) {
        return res.status(404).json({error: `Task ${taskID} not found`});
    }

    db.prepare('DELETE FROM tasks WHERE id = ?').run(taskID);
    return res.status(204).send();
});
*/
app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});

