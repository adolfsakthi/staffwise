
'use server';
import AddEmployeeForm from '@/components/employees/add-employee-form';
import EmployeeList from '@/components/employees/employee-list';
import type { Employee } from '@/lib/types';
import fs from 'fs/promises';
import path from 'path';

const employeesFilePath = path.join(process.cwd(), 'src', 'lib', 'employees.json');

async function getEmployees(): Promise<Employee[]> {
    try {
        const data = await fs.readFile(employeesFilePath, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
            // If the file doesn't exist, create it with some mock data
            const mockEmployees: Employee[] = [
                { id: '1', clientId: 'default_client', branchId: 'default_branch', property_code: 'D001', firstName: 'John', lastName: 'Doe', email: 'john.doe@example.com', department: 'Engineering', employeeCode: 'EMP001', shiftStartTime: '09:00', shiftEndTime: '18:00' },
                { id: '2', clientId: 'default_client', branchId: 'default_branch', property_code: 'D001', firstName: 'Jane', lastName: 'Smith', email: 'jane.smith@example.com', department: 'Housekeeping', employeeCode: 'EMP002', shiftStartTime: '09:00', shiftEndTime: '18:00' },
                { id: '3', clientId: 'default_client', branchId: 'default_branch', property_code: 'D002', firstName: 'Peter', lastName: 'Jones', email: 'peter.jones@example.com', department: 'Security', employeeCode: 'EMP003', shiftStartTime: '22:00', shiftEndTime: '06:00' },
            ];
            await fs.writeFile(employeesFilePath, JSON.stringify(mockEmployees, null, 2), 'utf-8');
            return mockEmployees;
        }
        console.error("Error reading employees file", error);
        return [];
    }
}


export default async function EmployeesPage() {
    const initialEmployees = await getEmployees();
    const propertyCode = 'D001';

    return (
        <div className="space-y-6">
            <AddEmployeeForm propertyCode={propertyCode} />
            <EmployeeList initialEmployees={initialEmployees} propertyCode={propertyCode}/>
        </div>
    )
}
