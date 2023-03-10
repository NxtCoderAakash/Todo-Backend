let express = require("express");

let sqlite3 = require("sqlite3");

let { open } = require("sqlite");
let path = require("path");
const cors = require("cors");
let dbPath = path.join(__dirname, "todoApplication.db");

let app = express();
app.use(express.json());
app.use(cors());

let initializeDbAndServer = async () => {
  db = await open({
    filename: dbPath,
    driver: sqlite3.Database,
  });
  app.listen(3000, () => {
    console.log(`The Server is running at http://localhost:3000`);
  });
};

initializeDbAndServer();

//API 0 Create a table todo

app.get("/", async (request, response) => {
  let createToDoTableQuery = `
    CREATE TABLE todo(
        id INTEGER PRIMARY KEY,
        todo VARCHAR(250),
        priority VARCHAR(250),
        status VARCHAR(250)
    );
    `;
  let newTable = await db.get(createToDoTableQuery);
  //   response.send(newTable);
  response.send("New  TODO Table Created");
});

//API 1

app.get("/todos/", async (request, response) => {
  try {
    let q_para = request.query;

    let {
      offset = 0,
      limit = 10,
      search_q = "",
      order = "ASC",
      order_by = "id",
      priority = "",
      status = "",
    } = q_para;

    let getStatusQuery = `
        SELECT 
            *
        FROM todo 
        WHERE 
            priority LIKE "%${priority}%" 
            AND status LIKE "%${status}%"
            AND todo LIKE "%${search_q}%" 
        ORDER BY ${order_by} ${order} 
        LIMIT ${limit} 
        OFFSET ${offset}
    `;
    console.log(getStatusQuery);
    let resultStatus = await db.all(getStatusQuery);
    response.send(resultStatus);
  } catch (e) {
    console.log(`The error is :${e.message}`);
    process.exit(1);
  }
});

//API 2

app.get("/todos/:todoId/", async (request, response) => {
  try {
    let { todoId } = request.params;
    let getTodoByIdQuery = `
    SELECT
        * 
    FROM 
        todo 
    WHERE 
        id=${todoId}
    `;
    let todoList = await db.get(getTodoByIdQuery);
    response.send(todoList);
  } catch (e) {
    console.log(`The error is :${e.message}`);
    process.exit(1);
  }
});

//API 3
app.post("/todos/", async (request, response) => {
  try {
    let todoDetails = request.body;
    let { id, todo, priority, status } = todoDetails;
    let createANewTodoQuery = `
    INSERT INTO
        todo(id,todo,priority,status) 
    VALUES
        (${id},'${todo}','${priority}','${status}');

    `;
    await db.run(createANewTodoQuery);
    response.send("Todo Successfully Added");
  } catch (e) {
    console.log(`The error is :${e.message}`);
    process.exit(1);
  }
});

//API 4

app.put("/todos/:todoId", async (request, response) => {
  try {
    let { todoId } = request.params;
    let { status, priority, todo } = request.body;
    let setQuery = "";
    let queryType = "";
    let outputType = "";
    if (status != undefined) {
      setQuery = status;
      queryType = "status";
      outputType = "Status";
    } else if (priority != undefined) {
      setQuery = priority;
      queryType = "priority";
      outputType = "Priority";
    } else {
      setQuery = todo;
      queryType = "todo";
      outputType = "Todo";
    }
    let updateQuery = `
    UPDATE 
        todo 
    SET 
        ${queryType}='${setQuery}'
    WHERE 
        id=${todoId};
    `;
    await db.run(updateQuery);
    response.send(`${outputType} Updated`);
  } catch (e) {
    console.log(`The error is :${e.message}`);
    process.exit(1);
  }
});

//API 5

app.delete("/todos/:todoId/", async (request, response) => {
  try {
    let { todoId } = request.params;
    let deleteQuery = `
    DELETE FROM
        todo 
    WHERE 
        id=${todoId};
    `;
    await db.run(deleteQuery);
    response.send("Todo Deleted");
  } catch (e) {
    console.log(`The error is :${e.message}`);
    process.exit(1);
  }
});

module.exports = app;
