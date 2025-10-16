
'use client';

import { useState } from 'react';
import AddEmployeeForm from '@/components/employees/add-employee-form';
import EmployeeList from '@/components/employees/employee-list';
import type { Employee } from '@/lib/types';

const MOCK_EMPLOYEES: Employee[] = [
    { id: '1', clientId: 'default_client', branchId: 'default_branch', property_code: 'D001', firstName: 'John', lastName: 'Doe', email: 'john.doe@example.com', department: 'Engineering', employeeCode: 'EMP001', shiftStartTime: '09:00', shiftEndTime: '18:00' },
    { id: '2', clientId: 'default_client', branchId: 'default_branch', property_code: 'D001', firstName: 'Jane', lastName: 'Smith', email: 'jane.smith@example.com', department: 'Housekeeping', employeeCode: 'EMP002', shiftStartTime: '09:00', shiftEndTime: '18:00' },
    { id: '3', clientId: 'default_client', branchId: 'default_branch', property_code: 'D002', firstName: 'Peter', lastName: 'Jones', email: 'peter.jones@example.com', department: 'Security', employeeCode: 'EMP003', shiftStartTime: '22:00', shiftEndTime: '06:00' },
];


export default function EmployeesPage() {
    const [employees, setEmployees] = useState<Employee[]>(MOCK_EMPLOYEES);
    const propertyCode = 'D001';

    const handleAddEmployee = (employeeData: Omit<Employee, 'id' | 'clientId' | 'branchId'>) => {
        const newEmployee: Employee = {
            ...employeeData,
            id: `emp-${Date.now()}`,
            clientId: 'default_client',
            branchId: 'default_branch',
        };
        setEmployees(prev => [...prev, newEmployee]);
    };

    return (
        <div className="space-y-6">
            <AddEmployeeForm propertyCode={propertyCode} onAddEmployee={handleAddEmployee} />
            <EmployeeList initialEmployees={employees} propertyCode={propertyCode}/>
        </div>
    )
}
