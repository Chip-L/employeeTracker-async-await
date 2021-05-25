const connection = require("../config/config");

/***  queries as promise objects ***/

// returns promise of all employees -- where and matches are optional for filtering (where is the WHERE clause and matches are the objects in an array to be matched)
const getAllEmployeesData = (where, matches) =>
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

const getDepartmentList = () =>
  new Promise((resolve, reject) => {
    const query = "SELECT * FROM department;";
    connection.query(query, (err, deptList) => {
      if (err) reject(err);
      resolve(deptList);
    });
  });

const getRoleList = () =>
  new Promise((resolve, reject) => {
    connection.query("SELECT * FROM role;", (err, roleList) => {
      if (err) reject(err);
      resolve(roleList);
    });
  });

// returns a list of employees with the Employee column
const getEmployeesAsEmployee = () =>
  new Promise((resolve, reject) => {
    const query = `SELECT id, CONCAT(first_name,' ', last_name) AS 'Employee'
    FROM employee;`;

    connection.query(query, (err, employeeList) => {
      if (err) reject(err);
      resolve(employeeList);
    });
  });

// returns a list of employees with the manager column
const getAllEmployeesAsManager = () =>
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
const getOnlyManagersAsManager = () =>
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

const getDepartmentBudget = () =>
  new Promise((resolve, reject) => {
    const query = `SELECT SUM(salary) AS 'Budget'
    FROM role
        JOIN employee ON role.id = employee.role_id
        JOIN department ON role.department_id = department.id 
    WHERE department_id = ?;`;

    connection.query(query, [deptId], (err, budget) => {
      if (err) reject(err);
      resolve(budget);
    });
  });

const addNewEmployee = (newEmployee) =>
  new Promise((resolve, reject) => {
    const query = `INSERT INTO employee(first_name, last_name, role_id, manager_id) VALUES (?,?,?,?)`;

    connection.query(query, Object.values(newEmployee), (err, results) => {
      if (err) reject(err);
      // console.log("in promise: ", results);
      resolve(results);
    });
  });

const addNewRole = (newRole) =>
  new Promise((resolve, reject) => {
    connection.query(`INSERT INTO role SET ?`, newRole, (err, res) => {
      if (err) reject(err);
      resolve(res);
    });
  });

const addNewDepartment = (newDept) =>
  new Promise((resolve, reject) => {
    connection.query(`INSERT INTO department SET ?`, newDept, (err, res) => {
      if (err) reject(err);
      resolve(res);
    });
  });

const updateEmployee = (newValues) =>
  new Promise((resolve, reject) => {
    connection.query(`UPDATE employee SET ? WHERE ?`, newValues, (err, res) => {
      if (err) reject(err);
      resolve(res);
    });
  });

const deleteEmployee = (empId) =>
  new Promise((resolve, reject) => {
    connection.query(`DELETE FROM employee WHERE id = ?`, empId, (err, res) => {
      if (err) reject(err);
      resolve(res);
    });
  });

const deleteRole = (roleId) =>
  new Promise((resolve, reject) => {
    connection.query(`DELETE FROM role WHERE id = ?`, roleId, (err, res) => {
      if (err) reject(err);
      resolve(res);
    });
  });

const deleteDepartment = (deptId) =>
  new Promise((resolve, reject) => {
    connection.query(
      `DELETE FROM department WHERE id = ?`,
      deptId,
      (err, res) => {
        if (err) reject(err);
        resolve(res);
      }
    );
  });

/*** exports ***/
exports.getAllEmployeesData = getAllEmployeesData;
exports.getDepartmentList = getDepartmentList;
exports.getRoleList = getRoleList;
exports.getEmployeesAsEmployee = getEmployeesAsEmployee;
exports.getAllEmployeesAsManager = getAllEmployeesAsManager;
exports.getOnlyManagersAsManager = getOnlyManagersAsManager;
exports.getDepartmentBudget = getDepartmentBudget;

exports.addNewEmployee = addNewEmployee;
exports.addNewRole = addNewRole;
exports.addNewDepartment = addNewDepartment;

exports.updateEmployee = updateEmployee;

exports.deleteEmployee = deleteEmployee;
exports.deleteRole = deleteRole;
exports.deleteDepartment = deleteDepartment;
