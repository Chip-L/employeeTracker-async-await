const inquirer = require("inquirer");
const mysql = require("mysql");
const cTable = require("console.table");

// create mysql connection
const connection = mysql.createConnection({
  host: "localhost",
  port: 3306,
  user: "root",
  password: "root",
  database: "employeeDB",
});

const showStartScreen = () => {
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
  console.log();
};

// get options
function start() {
  inquirer
    .prompt([
      {
        type: "list",
        message: "What would you like to do?",
        choices: [
          new inquirer.Separator("-- VIEWS --"),
          "View All Employees",
          "View All Employees By Department",
          "View All Employees By Role",
          "View All Employees By Manager",
          new inquirer.Separator("-- EMPLOYEE --"),
          "Add Employee",
          "Update Employee Manager",
          "Update Employee Role",
          "Remove Employee",
          new inquirer.Separator("-- OTHER --"),
          "Exit program",
          new inquirer.Separator(),
        ],
        name: "choice",
      },
    ])
    .then((answer) => {
      switch (answer.choice) {
        // -- VIEWS --"
        case "View All Employees":
          viewAllEmployees();
          break;
        case "View All Employees By Department":
          viewEmployeesByDepartment();
          break;
        case "View All Employees By Role":
          viewEmployeesByRole();
          break;
        case "View All Employees By Manager":
          viewEmployeesByManager();
          break;
        // -- EMPLOYEE --
        case "Add Employee":
          break;
        case "Update Employee Manager":
          break;
        case "Update Employee Role":
          break;
        case "Remove Employee":
          break;
        // -- OTHER --
        default:
          connection.end();
      }
    })
    .catch((error) => {
      if (error.isTtyError) {
        throw new Error(
          "Prompt couldn't be rendered in the current environment."
        );
      } else {
        throw error;
      }
    });
}

// add department

// add roles

// add employees

// view employees by department
function viewEmployeesByDepartment() {
  connection.query("SELECT * FROM department;", (err, deptList) => {
    if (err) throw err;
    inquirer
      .prompt({
        type: "list",
        message: "Which department would you like to view?",
        choices: deptList.map((obj) => obj.name),
        name: "choice",
      })
      .then((answer) => {
        connection.query(
          `SELECT 
              emp.id,
              emp.first_name,
              emp.last_name,
              role.title,
              department.name AS 'department',
              role.salary,
              CONCAT(mgr.first_name, ' ', mgr.last_name) AS 'manager'
          FROM
              employee emp
                  JOIN
              role ON role_id = role.id
                  JOIN
              department ON role.department_id = department.id
                  LEFT JOIN
              employee mgr ON emp.manager_id = mgr.id
          WHERE
              department.name = ?
          ORDER BY emp.id;`,
          [answer.choice],
          (err, employeeList) => {
            if (err) throw err;
            console.table(employeeList);
            start();
          }
        );
      })
      .catch((error) => {
        if (error.isTtyError) {
          throw new Error(
            "Prompt couldn't be rendered in the current environment."
          );
        } else {
          throw error;
        }
      });
  });
}

// view employees by roles
function viewEmployeesByRole() {
  connection.query("SELECT * FROM role;", (err, roleList) => {
    if (err) throw err;
    inquirer
      .prompt({
        type: "list",
        message: "Which employee role would you like to view?",
        choices: roleList.map((obj) => obj.title),
        name: "choice",
      })
      .then((answer) => {
        connection.query(
          `SELECT 
              emp.id,
              emp.first_name,
              emp.last_name,
              role.title,
              department.name AS 'department',
              role.salary,
              CONCAT(mgr.first_name, ' ', mgr.last_name) AS 'manager'
          FROM
              employee emp
                  JOIN
              role ON role_id = role.id
                  JOIN
              department ON role.department_id = department.id
                  LEFT JOIN
              employee mgr ON emp.manager_id = mgr.id
          WHERE
              role.title = ?
          ORDER BY emp.id;`,
          [answer.choice],
          (err, employeeList) => {
            if (err) throw err;
            console.table(employeeList);
            start();
          }
        );
      })
      .catch((error) => {
        if (error.isTtyError) {
          throw new Error(
            "Prompt couldn't be rendered in the current environment."
          );
        } else {
          throw error;
        }
      });
  });
}

// view all employees
function viewAllEmployees() {
  connection.query(
    `SELECT 
        emp.id AS 'ID',
        emp.first_name AS 'First Name',
        emp.last_name AS 'Last Name',
        role.title AS 'Title',
        department.name as 'Department',
        role.salary AS 'Salary',
        CONCAT(mgr.first_name, ' ', mgr.last_name) AS 'Manager'
    FROM
        employee emp
            JOIN
        role ON role_id = role.id
            JOIN
        department ON role.department_id = department.id
            LEFT JOIN
        employee mgr ON emp.manager_id = mgr.id
    ORDER BY emp.id;`,
    (err, res) => {
      if (err) throw err;
      console.log();
      console.table(res);
      start();
    }
  );
}

// update employee roles

/**** bonus ****/
// update employee managers

// view employee by manager
function viewEmployeesByManager() {
  connection.query(
    `SELECT DISTINCT
        mgr.id,
        CONCAT(mgr.first_name, ' ', mgr.last_name) AS 'Manager'
    FROM
        employee emp
            JOIN
        employee mgr ON emp.manager_id = mgr.id
    WHERE
        emp.manager_id IS NOT NULL
    ORDER BY mgr.first_name;`,
    (err, mgrList) => {
      if (err) throw err;
      inquirer
        .prompt({
          type: "list",
          message: "Which manager's employees would you like to view?",
          choices: mgrList.map((obj) => obj.Manager),
          name: "choice",
        })
        .then((answer) => {
          const mgrId =
            mgrList[
              mgrList.findIndex((manager) => manager.Manager === answer.choice)
            ].id;
          connection.query(
            `SELECT 
                emp.id,
                emp.first_name,
                emp.last_name,
                role.title,
                department.name AS 'department',
                role.salary,
                CONCAT(mgr.first_name, ' ', mgr.last_name) AS 'manager'
            FROM
                employee emp
                    JOIN
                role ON role_id = role.id
                    JOIN
                department ON role.department_id = department.id
                    LEFT JOIN
                employee mgr ON emp.manager_id = mgr.id
            WHERE
                emp.manager_id = ?
            ORDER BY emp.id;`,
            [mgrId],
            (err, res) => {
              if (err) throw err;
              console.table(res);
              start();
            }
          );
        })
        .catch((error) => {
          if (error.isTtyError) {
            throw new Error(
              "Prompt couldn't be rendered in the current environment."
            );
          } else {
            throw error;
          }
        });
    }
  );
}

// delete department

// delete roles

// delete employees

// View the total utilized budget of a department -- ie the combined salaries of all employees in that department

// make db connection
connection.connect((err) => {
  if (err) throw err;
  console.log(`connected as is ${connection.threadId}\n`);

  showStartScreen();
  start();
});
