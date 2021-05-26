const inquirer = require("inquirer");
const cTable = require("console.table");
require("dotenv").config();

const connection = require("./config/config");
const sql = require("./sqlQueries/queries");

// make db connection
connection.connect((err) => {
  if (err) throw err;
  console.log(`connected as is ${connection.threadId}\n`);

  showStartScreen();
  menu();
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
  console.log("|                            Now with Async/Await!  |");
  console.log("`---------------------------------------------------'");
  console.log();
};

// get options
function menu() {
  console.log();
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
async function viewAllEmployees() {
  const res = await sql.getAllEmployeesData();

  console.log();
  console.table(res);
  menu();
}

// view employees by department
async function viewEmployeesByDepartment() {
  try {
    const deptList = await sql.getDepartmentList();

    const answer = await inquirer.prompt({
      type: "list",
      message: "Which department would you like to view?",
      choices: deptList.map((dept) => dept.name),
      name: "choice",
    });

    const res = await sql.getAllEmployeesData("WHERE ?", [
      { name: answer.choice },
    ]);

    console.log();
    console.table(res);
    menu();
  } catch (err) {
    inquirerErr(err);
  }
}

// view employees by roles
async function viewEmployeesByRole() {
  try {
    const roleList = await sql.getRoleList();

    const answer = await inquirer.prompt({
      type: "list",
      message: "Which employee role would you like to view?",
      choices: roleList.map((obj) => obj.title),
      name: "choice",
    });

    const employeeList = await sql.getAllEmployeesData("WHERE ?", {
      title: answer.choice,
    });

    console.log();
    console.table(employeeList);
    menu();
  } catch (error) {
    inquirerErr(error);
  }
}

// add employees
async function addEmployee() {
  try {
    // get manager list (Any employee can be a manager)
    // get roleList -- these are done in parallel
    const [mgrList, roleList] = await Promise.all([
      sql.getAllEmployeesAsManager(),
      sql.getRoleList(),
    ]);

    // get employee information (first name, last name, manager, role (department is not needed as it is tied to role))
    const answer = await inquirer.prompt([
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

    const newEmployee = {
      first_name: answer.firstName,
      last_name: answer.lastName,
      role_id:
        roleList[roleList.findIndex((role) => role.title === answer.role)].id,
      manager_id:
        mgrList[mgrList.findIndex((mgr) => mgr.Manager === answer.manager)].id,
    };

    // add employee to DB
    const results = await sql.addNewEmployee(newEmployee);

    console.log();
    console.log(
      `${newEmployee.first_name} ${
        newEmployee.last_name
      } has been created with Employee ID: ${
        results.insertId
      } and a salary of $${roleList[newEmployee.role_id].salary}.`
    );

    menu();
  } catch (error) {
    inquirerErr(error);
  }
}

// update employee roles
async function updateEmployeeRole() {
  try {
    const [employeeList, roleList] = await Promise.all([
      sql.getEmployeesAsEmployee(),
      sql.getRoleList(),
    ]);

    const answer = await inquirer.prompt([
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

    const empId = {
      id: employeeList[
        employeeList.findIndex((emp) => emp.Employee === answer.employee)
      ].id,
    };
    const roleId = {
      role_id:
        roleList[roleList.findIndex((role) => role.title === answer.role)].id,
    };
    await sql.updateEmployee([roleId, empId]);

    console.log();
    console.log(
      `${answer.employee} has been updated to the new role ${answer.role}`
    );
    menu();
  } catch (error) {
    inquirerErr(error);
  }
}

// add roles
async function addNewRole() {
  try {
    // get departmentList
    const departmentList = await sql.getDepartmentList();
    const answer = await inquirer.prompt([
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

    const newRole = {
      title: answer.title,
      salary: answer.salary,
      department_id:
        departmentList[
          departmentList.findIndex((dept) => dept.name === answer.dept)
        ].id,
    };

    // add role to DB
    await sql.addNewRole(newRole);

    console.log();
    console.log(`${newRole.title} has been added as a role.`);

    menu();
  } catch (error) {
    inquirerErr(error);
  }
}

// add department
async function addNewDepartment() {
  try {
    const answer = await inquirer.prompt({
      type: "input",
      message: "What is the name of the new department?",
      name: "name",
    });

    await sql.addNewDepartment(answer);

    console.log();
    console.log(
      `${answer.name} has been updated.\n\nBe sure to add the roles for this department!\n`
    );
    menu();
  } catch (error) {
    inquirerErr(error);
  }
}

/**** bonus ****/
// view employee by manager
async function viewEmployeesByManager() {
  try {
    const mgrList = await sql.getOnlyManagersAsManager();
    const answer = await inquirer.prompt({
      type: "list",
      message: "Which manager's employees would you like to view?",
      choices: mgrList.map((obj) => obj.Manager),
      name: "choice",
    });

    const mgrId =
      mgrList[mgrList.findIndex((manager) => manager.Manager === answer.choice)]
        .id;
    const res = await sql.getAllEmployeesData(
      `WHERE emp.manager_id ${mgrId === null ? "IS NULL" : "= ?"}`,
      [mgrId]
    );

    console.log();
    console.table(res);
    menu();
  } catch (error) {
    inquirerErr(error);
  }
}

// update employee managers
function updateEmployeeManager() {
  try {
    const [employeeList, managerList] = await Promise.all([
      sql.getEmployeesAsEmployee(),
      sql.getAllEmployeesAsManager(),
    ]);

    // get employee to change
    const answer = inquirer.prompt([
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

    const empId = {
      id: employeeList[
        employeeList.findIndex(
          (employee) => employee.Employee === answer.employee
        )
      ].id,
    };
    const mgrId = {
      manager_id:
        managerList[
          managerList.findIndex((manager) => manager.Manager === answer.manager)
        ].id,
    };
    await sql.updateEmployee([mgrId, empId]);

    console.log();
    console.log(
      `${answers.employee} has been updated to have ${answers.manager} as their manager.`
    );
    menu();
  } catch (error) {
    inquirerErr(error);
  }
}

// delete employees
function removeEmployee() {
  let employeeList;

  sql
    .getEmployeesAsEmployee()
    .then((empList) => {
      employeeList = empList;
      return inquirer.prompt({
        type: "list",
        message: "Which employee would you like to remove? ",
        choices: employeeList.map((emp) => emp.Employee),
        name: "employee",
      });
    })
    .then((answer) => {
      const empId =
        employeeList[
          employeeList.findIndex((emp) => emp.Employee === answer.employee)
        ].id;
      return sql.deleteEmployee(empId).then(() => answer);
    })
    .then((answer) => {
      console.log();
      console.log(`${answer.employee} has been removed.`);

      menu();
    })
    .catch((error) => {
      inquirerErr(error);
    });
}

// delete roles
//TODO: add list of employees now stranded without roles or verify no Employees have role being deleted
function removeRole() {
  let roleList;

  sql
    .getRoleList()
    .then((list) => {
      roleList = list;
      return inquirer.prompt({
        type: "list",
        message: "Which role would you like to delete?",
        choices: roleList.map((role) => role.title),
        name: "role",
      });
    })
    .then((answer) => {
      const roleId =
        roleList[roleList.findIndex((role) => role.title === answer.role)].id;

      return sql.deleteRole(roleId).then(() => answer);
    })
    .then((answer) => {
      console.log();
      console.log(`${answer.role} has been removed.`);

      menu();
    })
    .catch((error) => {
      inquirerErr(error);
    });
}

// delete department
//TODO: add list of employees and roles now stranded without department or verify no Employees/Roles have department being deleted
function removeDepartment() {
  let departmentList;

  sql
    .getDepartmentList()
    .then((deptList) => {
      departmentList = deptList;

      return inquirer.prompt({
        type: "list",
        message: "Which department would you like to remove?",
        choices: departmentList.map((dept) => dept.name),
        name: "dept",
      });
    })
    .then((answer) => {
      deptId =
        departmentList[
          departmentList.findIndex((dept) => dept.name === answer.dept)
        ].id;

      return sql.deleteDepartment(deptId).then(() => answer);
    })
    .then((answer) => {
      console.log();
      console.log(`${answer.dept} has been removed.`);

      menu();
    })
    .catch((error) => {
      inquirerErr(error);
    });
}

// View the total utilized budget of a department -- ie the combined salaries of all employees in that department
function viewDepartmentBudget() {
  let departmentList;

  sql
    .getDepartmentList()
    .then((deptList) => {
      departmentList = deptList;
      return inquirer.prompt({
        type: "list",
        message: "Which department's budget would you like to see?",
        choices: departmentList.map((dept) => dept.name),
        name: "dept",
      });
    })
    .then((answer) => {
      deptId =
        departmentList[
          departmentList.findIndex((dept) => dept.name === answer.dept)
        ].id;

      return sql.getDepartmentBudget().then((budget) => {
        return { budget: budget, answer: answer };
      });
    })
    .then(({ budget, answer }) => {
      const budgetAmt = budget[0].Budget || 0;

      console.log();
      console.log(`The budget for ${answer.dept} is $${budgetAmt}.`);

      menu();
    })
    .catch((error) => {
      inquirerErr(error);
    });
}
