const express = require('express');
const app = express();
const port = 3000;

app.use(express.json());

const tasks = [
    {id: 1, title: "Accomplish Week 2 Backend Task", done: false},
    {id: 2, title: "Get a good night's sleep", done: false},
    {id: 3, title: "Accomplish ML Assignment", done: false},
];

app.get('/', (req, res) => {
    res.send("Hello World!");
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
    res.json (tasks);
})

app.get('/task/:id', (req, res) => {
    const taskID = parseInt (req.params.id, 10);
    const task = tasks.find(t => t.id === taskID);
    if (!task) {
        return res.status(404).json({error: `Task ${taskID} not found`});
    }
    res.json(task);
});

app.post('/tasks', (req, res) => {
   const {title} = req.body;
    if(!title || typeof title !== "string" || title.trim() === '') {
        return res.status(400).json ({error: "Title is required"});
    }
const nextId = tasks.length > 0 ? Math.max(...tasks.map(t => t.id)) + 1 : 1;
    const newTask = {
        id: nextId,
        title: title.trim(),
        done: false
    };
    tasks.push(newTask);
    res.status(201).json(newTask);
    }
);
app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});


