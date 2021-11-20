const express = require('express');
const cors = require('cors');

const { v4: uuidv4, v4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find(user => user.username === username);

  if (!user) {
    return response.status(404).json({ error: "User not found" });
  }

  request.user = user;

  return next();
}

app.post('/users', (request, response) => {
  const { name, username } = request.body;

  const userExists = users.some(user => user.username === username);

  if (userExists) {
    return response.status(400).json({ error: "User already exists!" });
  }

  const user = {
    id: v4(),
    name,
    username,
    todos: []
  }
  users.push(user);

  return response.status(201).json(user);

});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  
  const todos = user.todos
  
  return response.json(todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;

  const { user } = request;

  const todo = {
    id: v4(),
    title,
    deadline,
    done: false,
    created_at: new Date()
  }

  user.todos.push(todo);

  return response.status(201).json(todo);

});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { id } = request.params;
  const { user } = request;
  
  const indexTodo = user.todos.findIndex(todo => todo.id === id);

  if(indexTodo < 0){
    return response.status(404).json({error:"Você não pode realizar está ação"});
  }
  
  const todo = {
    id: id,
    title,
    deadline,
    done: false,
    created_at: new Date()
  }
  
  user.todos.splice(indexTodo,1, todo)
  
  return response.status(201).json(todo);

});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { id } = request.params
  const { user } = request;

  const indexTodo = user.todos.findIndex(todo => todo.id === id);

  if(indexTodo < 0){
    return response.status(404).json({error:"Algo deu errado, talvez você não possa realizar essa operação!"})  
  }
  
  user.todos[indexTodo].done = true
  
  return response.status(201).send(user.todos[indexTodo]);

});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { id } = request.params
  const { user } = request;

  const todoIndex = user.todos.findIndex(todo => todo.id === id);
  
  if(todoIndex < 0) return response.status(404).json({error:"Unable to perform this operation!"});
  
  user.todos.splice(todoIndex,1);
  
  return response.status(204).send();
});

module.exports = app;