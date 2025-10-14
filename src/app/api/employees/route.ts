
import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { Employee } from '@/lib/types';

const employeesFilePath = path.join(process.cwd(), 'src', 'lib', 'employees.json');

async function readEmployees(): Promise<Employee[]> {
    try {
        const data = await fs.readFile(employeesFilePath, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
            return [];
        }
        throw error;
    }
}

async function writeEmployees(employees: Employee[]): Promise<void> {
    await fs.writeFile(employeesFilePath, JSON.stringify(employees, null, 2), 'utf-8');
}

export async function GET(request: NextRequest) {
    try {
        const employees = await readEmployees();
        return NextResponse.json(employees);
    } catch (error) {
        return NextResponse.json({ message: 'Error reading employee data.' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const newEmployeeData = await request.json();
        if (!newEmployeeData) {
            return NextResponse.json({ message: 'Invalid employee data provided.' }, { status: 400 });
        }
        
        const employees = await readEmployees();
        const newEmployee: Employee = {
            ...newEmployeeData,
            id: (Math.max(0, ...employees.map(e => parseInt(e.id, 10))) + 1).toString(),
        };

        const updatedEmployees = [...employees, newEmployee];
        await writeEmployees(updatedEmployees);
        
        return NextResponse.json(newEmployee, { status: 201 });
    } catch (error) {
        return NextResponse.json({ message: 'Error adding new employee.' }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const employeeId = searchParams.get('id');

        if (!employeeId) {
            return NextResponse.json({ message: 'Employee ID is required.' }, { status: 400 });
        }

        const employees = await readEmployees();
        const updatedEmployees = employees.filter(emp => emp.id !== employeeId);

        if (employees.length === updatedEmployees.length) {
            return NextResponse.json({ message: 'Employee not found.' }, { status: 404 });
        }

        await writeEmployees(updatedEmployees);
        return NextResponse.json({ message: 'Employee deleted successfully.' }, { status: 200 });

    } catch (error) {
        return NextResponse.json({ message: 'Error deleting employee.' }, { status: 500 });
    }
}
