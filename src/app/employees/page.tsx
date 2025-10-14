'use client';
import { useMemo, useState } from 'react';
import AddEmployeeForm from '@/components/employees/add-employee-form';
import EmployeeList from '@/components/employees/employee-list';
import type { Employee } from '@/lib/types';

const MOCK_EMPLOYEES: Employee[] = [
    { id: '1', clientId: 'default_client', branchId: 'default_branch', property_code: 'D001', firstName: 'John', lastName: 'Doe', email: 'john.doe@example.com', department: 'Engineering', employeeCode: 'EMP001', shiftStartTime: '09:00', shiftEndTime: '18:00' },
    { id: '2', clientId: 'default_client', branchId: 'default_branch', property_code: 'D001', firstName: 'Jane', lastName: 'Smith', email: 'jane.smith@example.com', department: 'Housekeeping', employeeCode: 'EMP002', shiftStartTime: '09:00', shiftEndTime: '18:00' },
    { id: '3', clientId: 'default_client', branchId: 'default_branch', property_code: 'D002', firstName: 'Peter', lastName: 'Jones', email: 'peter.jones@example.com', department: 'Security', employeeCode: 'EMP003', shiftStartTime: '22:00', shiftEndTime: '06:00' },
];


export default function EmployeesPage() {
    const [employees, setEmployees] = useState(MOCK_EMPLOYEES);
    
    const propertyCode = 'D001';

    const filteredEmployees = useMemo(() => {
        if (!employees || !propertyCode) return [];
        return employees.filter(emp => emp.property_code === propertyCode);
    }, [employees, propertyCode]);
    
    const handleAddEmployee = (newEmployee: Omit<Employee, 'id' | 'clientId' | 'branchId'>) => {
        const newId = (Math.max(...employees.map(e => parseInt(e.id))) + 1).toString();
        setEmployees(prev => [...prev, { 
            ...newEmployee, 
            id: newId, 
            clientId: 'default_client', 
            branchId: 'default_branch' 
        }]);
    }

    const handleDeleteEmployee = (employeeId: string) => {
        setEmployees(prev => prev.filter(emp => emp.id !== employeeId));
    }

    return (
        <div className="space-y-6">
            <AddEmployeeForm onAddEmployee={handleAddEmployee} propertyCode={propertyCode} />
            <EmployeeList employees={filteredEmployees} isLoading={false} onDeleteEmployee={handleDeleteEmployee} />
        </div>
    )
}
