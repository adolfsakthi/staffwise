'use client';
import { useMemo } from 'react';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { Loader2 } from 'lucide-react';
import AddEmployeeForm from '@/components/employees/add-employee-form';
import EmployeeList from '@/components/employees/employee-list';
import type { Employee } from '@/lib/types';
import { collection, query, where } from 'firebase/firestore';


export default function EmployeesPage() {
    const { user, isUserLoading } = useUser();
    const firestore = useFirestore();
    
    const clientId = 'default_client';
    const branchId = 'default_branch';

    // @ts-ignore - In a real app this would be a custom claim
    const propertyCode = user?.property_code || null;

    const employeesQuery = useMemoFirebase(() => {
        if (!firestore || !clientId || !branchId) return null;
        return query(collection(firestore, `clients/${clientId}/branches/${branchId}/employees`));
    }, [firestore, clientId, branchId]);

    const { data: employees, isLoading, error } = useCollection<Employee>(employeesQuery);

    const filteredEmployees = useMemo(() => {
        if (!employees || !propertyCode) return [];
        // Assuming property_code is part of the employee document for filtering
        return employees.filter(emp => emp.property_code === propertyCode);
    }, [employees, propertyCode]);


    if (isUserLoading || !propertyCode) {
        return <div className="flex h-64 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>
    }

    return (
        <div className="space-y-6">
            <AddEmployeeForm clientId={clientId} branchId={branchId} propertyCode={propertyCode} />
            <EmployeeList employees={filteredEmployees} isLoading={isLoading} error={error} />
        </div>
    )
}
