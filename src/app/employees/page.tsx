
'use client';

import AddEmployeeForm from '@/components/employees/add-employee-form';
import EmployeeList from '@/components/employees/employee-list';
import type { Employee } from '@/lib/types';
import { useMockData } from '@/lib/mock-data-store';

export default function EmployeesPage() {
    const { employees, setEmployees } = useMockData();
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
    
    const handleRemoveEmployee = (employeeId: string) => {
        setEmployees(prev => prev.filter(e => e.id !== employeeId));
    }

    return (
        <div className="space-y-6">
            <AddEmployeeForm propertyCode={propertyCode} onAddEmployee={handleAddEmployee} />
            <EmployeeList employees={employees} propertyCode={propertyCode} onRemoveEmployee={handleRemoveEmployee}/>
        </div>
    )
}
