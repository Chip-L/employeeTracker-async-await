const inquirer = require("inquirer");
const mysql = require("mysql");
const cTable = require("console.table");
require("dotenv").config();

// create mysql connection
const connection = mysql.createConnection({
  host: "localhost",
  port: 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

// make db connection
connection.connect((err) => {
  if (err) throw err;
  console.log(`connected as is ${connection.threadId}\n`);

  showStartScreen();
  menu();
});

/***  queries as promise objects ***/

// returns promise of all employees -- where and matches are optional for filtering (where is the WHERE clause and matches are the objects in an array to be matched)
const getAllEmployeesDataSQL = (where, matches) =>
  new Promise((resolve, reject) => {
    const query = `SELECT 
        emp.id AS 'ID',
        emp.first_name AS 'First Name',
        emp.last_name AS 'Last Name',
        role.title AS 'Title',
        department.name as 'Department',
        role.salary AS 'Salary',
        CONCAT(mgr.first_name, ' ', mgr.last_name) AS 'Manager'
    FROM employee emp
      JOIN role ON role_id = role.id
      JOIN department ON role.department_id = department.id
      LEFT JOIN employee mgr ON emp.manager_id = mgr.id
    ${!where ? "" : where}
    ORDER BY emp.id;`;

    connection.query(query, matches, (err, res) => {
      if (err) reject(err);
      resolve(res);
    });
  });

const getDepartmentListSQL = () =>
  new Promise((resolve, reject) => {
    const query = "SELECT * FROM department;";
    connection.query(query, (err, deptList) => {
      if (err) reject(err);
      resolve(deptList);
    });
  });

const getRoleListSQL = () =>
  new Promise((resolve, reject) => {
    connection.query("SELECT * FROM role;", (err, roleList) => {
      if (err) reject(err);
      resolve(roleList);
    });
  });

// returns a list of employees with the Employee column
const getEmployeesAsEmployeeSQL = () =>
  new Promise((resolve, reject) => {
    const query = `SELECT id, CONCAT(first_name,' ', last_name) AS 'Employee'
    FROM employee;`;

    connection.query(query, (err, employeeList) => {
      if (err) reject(err);
      resolve(employeeList);
    });
  });

// returns a list of employees with the manager column
const getAllEmployeesAsManagerSQL = () =>
  new Promise((resolve, reject) => {
    const query = `SELECT 
        id,
        CONCAT(first_name, ' ', last_name) AS 'Manager'
    FROM employee
    ORDER BY id;`;

    connection.query(query, (err, mgrList) => {
      if (err) reject(err);

      // add no choice for the manager to the list
      mgrList.push({ id: null, Manager: "No direct manager" });
      resolve(mgrList);
    });
  });

// limit list of managers to employees that ARE managers
const getOnlyManagersAsManagerSQL = () =>
  new Promise((resolve, reject) => {
    const query = `SELECT DISTINCT
        mgr.id,
        CONCAT(mgr.first_name, ' ', mgr.last_name) AS 'Manager'
    FROM employee emp
        JOIN employee mgr ON emp.manager_id = mgr.id
    WHERE emp.manager_id IS NOT NULL
    ORDER BY mgr.first_name;`;

    connection.query(query, (err, mgrList) => {
      if (err) reject(err);

      // add no choice for the manager to the list
      mgrList.push({ id: null, Manager: "No direct manager" });
      resolve(mgrList);
    });
  });

const addNewEmployeeSQL = (newEmployee) =>
  new Promise((resolve, reject) => {
    const query = `INSERT INTO employee(first_name, last_name, role_id, manager_id) VALUES (?,?,?,?)`;

    connection.query(query, Object.values(newEmployee), (err, results) => {
      if (err) reject(err);
      // console.log("in promise: ", results);
      resolve({ results: results, newEmployee: newEmployee });
    });
  });

const addNewRoleSQL = (newRole) =>
  new Promise((resolve, reject) => {
    connection.query(`INSERT INTO role SET ?`, newRole, (err, res) => {
      if (err) reject(err);
      resolve(res);
    });
  });

const addNewDepartmentSQL = (newDept) =>
  new Promise((resolve, reject) => {
    connection.query(`INSERT INTO department SET ?`, newDept, (err, res) => {
      if (err) reject(err);
      resolve(res);
    });
  });

const updateEmployeeSQL = (newValues) =>
  new Promise((resolve, reject) => {
    connection.query(`UPDATE employee SET ? WHERE ?`, newValues, (err, res) => {
      if (err) reject(err);
      resolve(res);
    });
  });

/*** util functions ***/
// recommended test for inquirer errors from https://www.npmjs.com/package/inquirer
const inquirerErr = (error) => {
  if (error.isTtyError) {
    throw new Error("Prompt couldn't be rendered in the current environment.");
  } else {
    throw error;
  }
};

/*** Start program execution ***/
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
function menu() {
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
          "View the Budget of a Department",
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
        case "View the Budget of a Department":
          viewDepartmentBudget();
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
          removeDepartment();
          break;
        default:
          // Exit
          connection.end();
      }
    })
    .catch((error) => {
      inquirerErr(error);
    });
}

// view all employees
function viewAllEmployees() {
  getAllEmployeesDataSQL().then((res) => {
    console.log();
    console.table(res);
    menu();
  });
}

// view employees by department
function viewEmployeesByDepartment() {
  getDepartmentListSQL()
    .then((deptList) =>
      inquirer.prompt({
        type: "list",
        message: "Which department would you like to view?",
        choices: deptList.map((dept) => dept.name),
        name: "choice",
      })
    )
    .then((answer) =>
      getAllEmployeesDataSQL("WHERE ?", [{ name: answer.choice }])
    )
    .then((res) => {
      console.log();
      console.table(res);
      menu();
    })
    .catch((err) => {
      inquirerErr(err);
    });
}

// view employees by roles
function viewEmployeesByRole() {
  getRoleListSQL()
    .then((roleList) =>
      inquirer.prompt({
        type: "list",
        message: "Which employee role would you like to view?",
        choices: roleList.map((obj) => obj.title),
        name: "choice",
      })
    )
    .then((answer) =>
      getAllEmployeesDataSQL("WHERE ?", [{ title: answer.choice }])
    )
    .then((employeeList) => {
      console.log();
      console.table(employeeList);
      menu();
    })
    .catch((error) => {
      inquirerErr(error);
    });
}

// add employees
function addEmployee() {
  // set these variables so they are accessible throughout the chain
  let mgrList, roleList;

  // get manager list (Any employee can be a manager)
  // get roleList -- these are done in parallel
  Promise.all([getAllEmployeesAsManagerSQL(), getRoleListSQL()])
    .then((lists) => {
      mgrList = lists[0];
      roleList = lists[1];

      // get employee information (first name, last name, manager, role (department is not needed as it is tied to role))
      return inquirer.prompt([
        {
          type: "input",
          message: "Employee's first name: ",
          name: "firstName",
          validate: (firstName) => /^[a-zA-Z]+( [a-zA-Z]*)*$/.test(firstName),
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
      ]);
    })
    .then((answer) => {
      const newEmployee = {
        first_name: answer.firstName,
        last_name: answer.lastName,
        role_id:
          roleList[roleList.findIndex((role) => role.title === answer.role)].id,
        manager_id:
          mgrList[mgrList.findIndex((mgr) => mgr.Manager === answer.manager)]
            .id,
      };
      return newEmployee;
    })
    // add employee to DB
    .then((newEmployee) => addNewEmployeeSQL(newEmployee))
    .then(({ results, newEmployee }) => {
      console.log();
      console.log(
        `${newEmployee.first_name} ${
          newEmployee.last_name
        } has been created with Employee ID: ${
          results.insertId
        } and a salary of $${roleList[newEmployee.role_id].salary}.`
      );

      menu();
    })
    .catch((error) => {
      inquirerErr(error);
    });
}

// update employee roles
function updateEmployeeRole() {
  let employeeList, roleList;

  // get employeeList
  Promise.all([getEmployeesAsEmployeeSQL(), getRoleListSQL()])
    .then((lists) => {
      employeeList = lists[0];
      roleList = lists[1];

      return inquirer.prompt([
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
      ]);
    })
    .then((answers) => {
      const empId = {
        id: employeeList[
          employeeList.findIndex((emp) => emp.Employee === answers.employee)
        ].id,
      };
      const roleId = {
        role_id:
          roleList[roleList.findIndex((role) => role.title === answers.role)]
            .id,
      };
      return updateEmployeeSQL([roleId, empId]).then(() => answers);
    })
    .then((answers) => {
      console.log();
      console.log(
        `${answers.employee} has been updated to the new role ${answers.role}`
      );
      menu();
    })
    .catch((error) => {
      inquirerErr(error);
    });
}

// add roles
function addNewRole() {
  let departmentList;
  // get departmentList
  getDepartmentListSQL()
    .then((deptList) => {
      departmentList = deptList;
      // question the information
      return inquirer.prompt([
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
      ]);
    })
    .then((answers) => {
      const newRole = {
        title: answers.title,
        salary: answers.salary,
        department_id:
          departmentList[
            departmentList.findIndex((dept) => dept.name === answers.dept)
          ].id,
      };

      // add role to DB
      return addNewRoleSQL(newRole).then(() => newRole);
    })
    .then((newRole) => {
      console.log();
      console.log(`${newRole.title} has been added as a role.`);

      menu();
    })
    .catch((error) => {
      inquirerErr(error);
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
    .then((answer) => addNewDepartmentSQL(answer).then(() => answer))
    .then((answer) => {
      console.log(
        `${answer.name} has been updated.\n\nBe sure to add the roles for this department!\n`
      );

      menu();
    })
    .catch((error) => {
      inquirerErr(error);
    });
}

/**** bonus ****/
// view employee by manager
function viewEmployeesByManager() {
  let mgrList;

  getOnlyManagersAsManagerSQL()
    .then((managerList) => {
      mgrList = managerList;
      return inquirer.prompt({
        type: "list",
        message: "Which manager's employees would you like to view?",
        choices: mgrList.map((obj) => obj.Manager),
        name: "choice",
      });
    })
    .then((answer) => {
      const mgrId =
        mgrList[
          mgrList.findIndex((manager) => manager.Manager === answer.choice)
        ].id;
      return getAllEmployeesDataSQL(
        `WHERE emp.manager_id ${mgrId === null ? "IS NULL" : "= ?"}`,
        [mgrId]
      );
    })
    .then((res) => {
      console.table(res);
      menu();
    })
    .catch((error) => {
      inquirerErr(error);
    });
}

// update employee managers
function updateEmployeeManager() {
  let employeeList;
  let managerList;
  // get employee to change
  Promise.all([getEmployeesAsEmployeeSQL(), getAllEmployeesAsManagerSQL()])
    .then((lists) => {
      employeeList = lists[0];
      managerList = lists[1];

      // get new information
      return inquirer.prompt([
        {
          type: "list",
          message: "Which employee would you like to change?",
          choices: employeeList.map((employee) => employee.Employee),
          name: "employee",
        },
        {
          type: "list",
          message: "Who is the new manager?",
          choices: managerList.map((manager) => manager.Manager),
          name: "manager",
        },
      ]);
    })
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
          managerList[
            managerList.findIndex(
              (manager) => manager.Manager === answers.manager
            )
          ].id,
      };

      return updateEmployeeSQL([mgrId, empId]).then(() => answers);
    })
    .then((answers) => {
      console.log();
      console.log(
        `${answers.employee} has been updated to have ${answers.manager} as their manager.`
      );

      menu();
    })
    .catch((error) => {
      inquirerErr(error);
    });
}

// delete employees
function removeEmployee() {
  connection.query(
    `SELECT id, CONCAT(first_name, " ",last_name) AS 'Employee'
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

              menu();
            }
          );
        })
        .catch((error) => {
          inquirerErr(error);
        });
    }
  );
}

// delete roles
//TODO: add list of employees now stranded without roles or verify no Employees have role being deleted
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

            menu();
          }
        );
      })
      .catch((error) => {
        inquirerErr(error);
      });
  });
}

// delete department
//TODO: add list of employees and roles now stranded without department or verify no Employees/Roles have department being deleted
function removeDepartment() {
  connection.query(`SELECT * FROM department`, (err, departmentList) => {
    if (err) throw err;

    inquirer
      .prompt({
        type: "list",
        message: "Which department would you like to remove?",
        choices: departmentList.map((dept) => dept.name),
        name: "dept",
      })
      .then((answer) => {
        deptId =
          departmentList[
            departmentList.findIndex((dept) => dept.name === answer.dept)
          ].id;

        connection.query(
          `DELETE FROM department WHERE id = ?`,
          [deptId],
          (err, res) => {
            if (err) throw err;

            console.log(`${answer.dept} has been removed.`);

            menu();
          }
        );
      })
      .catch((error) => {
        inquirerErr(error);
      });
  });
}

// View the total utilized budget of a department -- ie the combined salaries of all employees in that department
function viewDepartmentBudget() {
  connection.query(`SELECT * FROM department`, (err, departmentList) => {
    if (err) throw err;

    inquirer
      .prompt({
        type: "list",
        message: "Which department's budget would you like to see?",
        choices: departmentList.map((dept) => dept.name),
        name: "dept",
      })
      .then((answer) => {
        deptId =
          departmentList[
            departmentList.findIndex((dept) => dept.name === answer.dept)
          ].id;

        connection.query(
          `SELECT SUM(salary) AS 'Budget'
          FROM role
              JOIN employee ON role.id = employee.role_id
              JOIN department ON role.department_id = department.id 
          WHERE department_id = ?;`,
          [deptId],
          (err, budget) => {
            if (err) throw err;

            const budgetAmt = budget[0].Budget || 0;
            console.log(`The budget for ${answer.dept} is $${budgetAmt}.`);

            menu();
          }
        );

        console.log();
      })
      .catch((error) => {
        inquirerErr(error);
      });
  });
}
