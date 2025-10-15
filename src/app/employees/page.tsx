
'use server';
import AddEmployeeForm from '@/components/employees/add-employee-form';
import EmployeeList from '@/components/employees/employee-list';
import type { Employee } from '@/lib/types';

const MOCK_EMPLOYEES: Employee[] = [
    { id: '1', clientId: 'default_client', branchId: 'default_branch', property_code: 'D001', firstName: 'John', lastName: 'Doe', email: 'john.doe@example.com', department: 'Engineering', employeeCode: 'EMP001', shiftStartTime: '09:00', shiftEndTime: '18:00' },
    { id: '2', clientId: 'default_client', branchId: 'default_branch', property_code: 'D001', firstName: 'Jane', lastName: 'Smith', email: 'jane.smith@example.com', department: 'Housekeeping', employeeCode: 'EMP002', shiftStartTime: '09:00', shiftEndTime: '18:00' },
    { id: '3', clientId: 'default_client', branchId: 'default_branch', property_code: 'D002', firstName: 'Peter', lastName: 'Jones', email: 'peter.jones@example.com', department: 'Security', employeeCode: 'EMP003', shiftStartTime: '22:00', shiftEndTime: '06:00' },
];

async function getEmployees(): Promise<Employee[]> {
    return MOCK_EMPLOYEES;
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
