'use client';
import { useMemo } from 'react';
import { useUser } from '@/firebase';
import { Loader2 } from 'lucide-react';
import AddEmployeeForm from '@/components/employees/add-employee-form';
import EmployeeList from '@/components/employees/employee-list';
import { MOCK_EMPLOYEES } from '@/lib/mock-data';

export default function EmployeesPage() {
    const { user, isUserLoading } = useUser();
    
    const clientId = 'default_client';
    const branchId = 'default_branch';

    // @ts-ignore - In a real app this would be a custom claim
    const propertyCode = user?.property_code || 'D001';

    const employees = useMemo(() => {
        return MOCK_EMPLOYEES.filter(emp => emp.property_code === propertyCode);
    }, [propertyCode]);

    if (isUserLoading) {
        return <div className="flex h-64 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>
    }

    return (
        <div className="space-y-6">
            <AddEmployeeForm clientId={clientId} branchId={branchId} propertyCode={propertyCode} />
            <EmployeeList employees={employees} />
        </div>
    )
}
