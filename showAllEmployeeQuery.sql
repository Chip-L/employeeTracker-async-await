USE employeedb;
SELECT 
    emp.id,
    emp.first_name,
    emp.last_name,
    role.title,
    department.name as 'department',
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
ORDER BY emp.id;