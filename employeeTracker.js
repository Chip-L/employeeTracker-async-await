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
          "Add New Role",
          "Add New Department",
          "Remove Role",
          "Remove Department",
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
          addEmployee();
          break;
        case "Update Employee Manager":
          updateEmployeeManager();
          break;
        case "Update Employee Role":
          updateEmployeeRole();
          break;
        case "Remove Employee":
          removeEmployee();
          break;
        // -- OTHER --
        case "Add New Role":
          addNewRole();
          break;
        case "Add New Department":
          addNewDepartment();
          break;
        case "Remove Role":
          removeRole();
          break;
        case "Remove Department":
          break;
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

// add employees
function addEmployee() {
  // get manager list (Any employee can be a manager)
  connection.query(
    `SELECT 
        id,
        CONCAT(first_name, ' ', last_name) AS 'Manager'
    FROM
        employee
    ORDER BY id;`,
    (err, mgrList) => {
      if (err) throw err;

      // add no choice for the manager to the list
      mgrList.push({ id: null, Manager: "No direct manager" });

      // get list of roles
      connection.query("SELECT * FROM role;", (err, roleList) => {
        if (err) throw err;

        // get employee information (first name, last name, manager, role (department is not needed as it is tied to role))
        inquirer
          .prompt([
            {
              type: "input",
              message: "Employee's first name: ",
              name: "firstName",
              validate: (firstName) =>
                /^[a-zA-Z]+( [a-zA-Z]*)*$/.test(firstName),
            },
            {
              type: "input",
              message: "Employee's last name: ",
              name: "lastName",
              validate: (lastName) => /^[a-zA-Z]+( [a-zA-Z]*)*$/.test(lastName),
            },
            {
              type: "list",
              message: "What is the employee's role? ",
              choices: roleList.map((role) => role.title),
              name: "role",
            },
            {
              type: "list",
              message: "Who is the direct manager? ",
              choices: mgrList.map((manager) => manager.Manager),
              name: "manager",
            },
          ])
          .then((answer) => {
            console.log(answer);

            const newEmployee = {
              first_name: answer.firstName,
              last_name: answer.lastName,
              role_id:
                roleList[
                  roleList.findIndex((role) => role.title === answer.role)
                ].id,
              manager_id:
                mgrList[
                  mgrList.findIndex((mgr) => mgr.Manager === answer.manager)
                ].id,
            };

            console.log(Object.values(newEmployee));

            connection.query(
              `INSERT INTO employee(first_name, last_name, role_id, manager_id)
              VALUES (?,?,?,?)`,
              Object.values(newEmployee),
              (err, results) => {
                if (err) throw err;

                console.log(
                  `${newEmployee.first_name} ${
                    newEmployee.last_name
                  } has been created with Employee ID: ${
                    results.insertId
                  } and a salary of $${roleList[newEmployee.role_id].salary}`
                );

                start();
              }
            );

            // add employee to DB
          })
          .catch((err) => {
            console.log("catch inquirer");
            throw err;
          });
      });
    }
  );
}

// update employee roles
function updateEmployeeRole() {
  // get employeeList
  connection.query(
    `SELECT id, CONCAT(first_name,' ', last_name) AS 'Employee'
    FROM employee;`,
    (err, employeeList) => {
      if (err) throw err;
      connection.query(
        `SELECT id, title 
        FROM role;`,
        (err, roleList) => {
          if (err) throw err;
          inquirer
            .prompt([
              {
                type: "list",
                message: "Which employee would you like to change?",
                choices: employeeList.map((emp) => emp.Employee),
                name: "employee",
              },
              {
                type: "list",
                message: "What is the new role?",
                choices: roleList.map((role) => role.title),
                name: "role",
              },
            ])
            .then((answers) => {
              const empId = {
                id: employeeList[
                  employeeList.findIndex(
                    (emp) => emp.Employee === answers.employee
                  )
                ].id,
              };
              const roleId = {
                role_id:
                  roleList[
                    roleList.findIndex((role) => role.title === answers.role)
                  ].id,
              };

              connection.query(
                `UPDATE employee SET ? WHERE ?`,
                [roleId, empId],
                (err, res) => {
                  if (err) throw err;

                  console.log(
                    `${answers.employee} has been updated to the new role ${answers.role}`
                  );

                  start();
                }
              );
            })
            .catch((err) => {
              if (err) throw err;
            });
        }
      );
    }
  );
  // get roleList
  // ask which employee and role to update
  // update DB
}

// add roles
function addNewRole() {
  // get departmentList
  connection.query(`SELECT * FROM department`, (err, departmentList) => {
    if (err) throw err;

    // question the information
    inquirer
      .prompt([
        {
          type: "input",
          message: "What is the title of the role?",
          name: "title",
        },
        {
          type: "input",
          message: "What is the salary for this role?",
          name: "salary",
          validate: (salary) => !isNaN(salary),
        },
        {
          type: "list",
          message: "Which department does this role belong to?",
          choices: departmentList.map((dept) => dept.name),
          name: "dept",
        },
      ])
      .then((answers) => {
        console.table(departmentList);
        const newRole = {
          title: answers.title,
          salary: answers.salary,
          department_id:
            departmentList[
              departmentList.findIndex((dept) => dept.name === answers.dept)
            ].id,
        };

        // add role to DB
        connection.query(`INSERT INTO role SET ?`, newRole, (err, res) => {
          if (err) throw err;

          console.log(`${newRole.title} has been added as a role.`);

          start();
        });
      })
      .catch((err) => {
        if (err) throw err;
      });
  });
}

// add department
function addNewDepartment() {
  inquirer
    .prompt({
      type: "input",
      message: "What is the name of the new department?",
      name: "name",
    })
    .then((answer) => {
      console.log(answer);
      connection.query(`INSERT INTO department SET ?`, answer, (err, res) => {
        if (err) throw err;

        console.log(
          `${answer.name} has been updated.\n\nBe sure to add the roles for this department!\n`
        );

        start();
      });
    })
    .catch((err) => {
      if (err) throw err;
    });
}

/**** bonus ****/
// view employee by manager
function viewEmployeesByManager() {
  // limit list of managers to employees that ARE managers
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

      // add no choice for the manager to the list
      mgrList.push({ id: null, Manager: "No direct manager" });

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
                emp.manager_id ${mgrId === null ? "IS NULL" : "= ?"}
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

// update employee managers
function updateEmployeeManager() {
  // get employee to change
  connection.query(
    `SELECT id, CONCAT(first_name, ' ', last_name) AS "Employee"
    FROM employee`,
    (err, employeeList) => {
      if (err) throw err;
      // get manager list (Any employee can be a manager) and add no choice for the manager
      const mgrList = [
        ...employeeList,
        { id: null, Employee: "No direct manager" },
      ];

      // get new information
      inquirer
        .prompt([
          {
            type: "list",
            message: "Which employee would you like to change?",
            choices: employeeList.map((employee) => employee.Employee),
            name: "employee",
          },
          {
            type: "list",
            message: "Who is the new manager?",
            choices: mgrList.map((manager) => manager.Employee),
            name: "manager",
          },
        ])
        .then((answers) => {
          const empId = {
            id: employeeList[
              employeeList.findIndex(
                (employee) => employee.Employee === answers.employee
              )
            ].id,
          };
          const mgrId = {
            manager_id:
              mgrList[
                mgrList.findIndex(
                  (manager) => manager.Employee === answers.manager
                )
              ].id,
          };

          // console.log("empId:", empId, "\nmgrId:", mgrId);
          connection.query(
            `UPDATE employee SET ? WHERE ?`,
            [mgrId, empId],
            (err, res) => {
              if (err) throw err;

              console.log(
                `${answers.employee} has been updated to have ${answers.manager} as their manager.`
              );

              start();
            }
          );
        })
        .catch((err) => {
          if (err) throw err;
        });
    }
  );
  // update employee
}

// delete employees
function removeEmployee() {
  connection.query(
    `SELECT id, CONCAT(first_name, " ",last_name) AS "Employee"
    FROM employee;`,
    (err, employeeList) => {
      if (err) throw err;

      inquirer
        .prompt({
          type: "list",
          message: "Which employee would you like to remove? ",
          choices: employeeList.map((emp) => emp.Employee),
          name: "employee",
        })
        .then((answer) => {
          if (err) throw err;

          const empId =
            employeeList[
              employeeList.findIndex((emp) => emp.Employee === answer.employee)
            ].id;

          connection.query(
            `DELETE FROM employee WHERE id = ?`,
            [empId],
            (err, res) => {
              if (err) throw err;

              console.log(`${answer.employee} has been removed.`);

              start();
            }
          );
        })
        .catch((err) => {
          if (err) throw err;
        });
    }
  );
}

// delete roles
function removeRole() {
  connection.query(`SELECT * FROM role;`, (err, roleList) => {
    if (err) throw err;

    inquirer
      .prompt({
        type: "list",
        message: "Which role would you like to delete?",
        choices: roleList.map((role) => role.title),
        name: "role",
      })
      .then((answer) => {
        const roleId =
          roleList[roleList.findIndex((role) => role.title === answer.role)].id;

        connection.query(
          `DELETE FROM role WHERE id = ?`,
          [roleId],
          (err, res) => {
            if (err) throw err;

            console.log(`${answer.role} has been removed.`);

            start();
          }
        );
      })
      .catch((err) => {
        if (err) throw err;
      });
  });
}
// delete department

// View the total utilized budget of a department -- ie the combined salaries of all employees in that department

// make db connection
connection.connect((err) => {
  if (err) throw err;
  console.log(`connected as is ${connection.threadId}\n`);

  showStartScreen();
  start();
});
