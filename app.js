const express = require('express');
const app = express();
const port = 3000;
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./openapi.json');
const path = require('path');
//declare the database connection
const Database = require('better-sqlite3');


//connecting to the database
const db = new Database(path.join(__dirname, 'tasks.db'));

db.exec(`CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY,
    title TEXT,
    done BOOLEAN
)`);

const count = db.prepare('SELECT COUNT(*) AS count FROM tasks').get().count;
 if (count === 0) {
    const insert = db.prepare('INSERT INTO tasks (title, done) VALUES (?, ?) ');
    insert.run('Accomplish Week 3 Backend Task', 0);
    insert.run('Watch Spider-Man: Brand New Day', 0);
    insert.run('Go to the gym', 0);
 }

app.use(express.json());

const formatTask = (task) => ({
    ...task,
    done: Boolean(task.done)
});

/*app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
const tasks = [
    {id: 1, title: "Accomplish Week 2 Backend Task", done: false},
    {id: 2, title: "Get a good night's sleep", done: false},
    {id: 3, title: "Accomplish ML Assignment", done: false},
]; */ 

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
    const tasks = db.prepare('SELECT * FROM tasks').all();
    //res.json(tasks);

    const formattedTasks = tasks.map(formatTask);

    res.json(formattedTasks);
});


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
    const task = tasks.find(t => t.id === taskID);

    if(!task) {
        return res.status(400).json({error: `Task ${taskID} not found`});
    }

    const {title, done} = req.body;

    if(title === undefined && done === undefined) {
        return res.status(400).json({error: "No fields to update"});
    }

    if(title !== undefined) {
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

});

app.delete ('/tasks/:id', (req, res) => {
    const taskID = parseInt(req.params.id, 10);
    const taskIndex = tasks.findIndex(t => t.id === taskID);

    if(taskIndex === -1) {
        return res.status(404).json({error: `Task ${taskID} not found`});
    }

    tasks.splice(taskIndex, 1);
    res.status(204).send();
});

app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});

