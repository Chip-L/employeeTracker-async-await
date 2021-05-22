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

// get options
function start() {
  console.log(start);
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
