const inquirer = require("inquirer");
const mysql = require("mysql");
const consoleTable = require("console.table");

// create mysql connection
const connection = mysql.createConnection({
  host: "localhost",
  port: 3306,
  user: "root",
  password: "root",
  database: "employeeDB",
});

function showStartScreen() {
  console.log(",---------------------------------------------------.");
  console.log("|   _____                 _                         |");
  console.log("|  | ____|_ __ ___  _ __ | | ___  _   _  ___  ___   |");
  console.log("|  |  _| | '_ ` _ \\| '_ \\| |/ _ \\| | | |/ _ \\/ _ \\  |");
  console.log("|  | |___| | | | | | |_) | | (_) | |_| |  __/  __/  |");
  console.log("|  |_____|_| |_| |_| .__/|_|\\___/ \\__, |\\___|\\___|  |");
  console.log("|                  |_|            |___/             |");
  console.log("|   __  __                                          |");
  console.log("|  |  \\/  | __ _ _ __   __ _  __ _  ___ _ __        |");
  console.log("|  | |\\/| |/ _` | '_ \\ / _` |/ _` |/ _ \\ '__|       |");
  console.log("|  | |  | | (_| | | | | (_| | (_| |  __/ |          |");
  console.log("|  |_|  |_|\\__,_|_| |_|\\__,_|\\__, |\\___|_|          |");
  console.log("|                            |___/                  |");
  console.log("|                                                   |");
  console.log("`---------------------------------------------------'");
}
// get options
function start() {
  showStartScreen();

  connection.end();
}

// add department

// add roles

// add employees

// view department

// view roles

// view employees

// update employee roles

/**** bonus ****/
// update employee managers

// view employee by manager

// delete department

// delete roles

// delete employees

// View the total utilized budget of a department -- ie the combined salaries of all employees in that department

// make db connection
connection.connect((err) => {
  if (err) throw err;
  console.log(`connected as is ${connection.threadId}\n`);
  start();
});
