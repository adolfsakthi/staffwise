
'use client';

import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Filter } from "lucide-react";

export default function EmployeeReportFilters() {
    return (
        <div className="mb-4 rounded-lg bg-gray-800 p-4 text-white">
            <div className="grid grid-cols-2 gap-4 md:grid-cols-6">
                <Select>
                    <SelectTrigger className="bg-gray-700 border-gray-600">
                        <SelectValue placeholder="Month" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="aug">August</SelectItem>
                        <SelectItem value="sep">September</SelectItem>
                    </SelectContent>
                </Select>
                <Select>
                    <SelectTrigger className="bg-gray-700 border-gray-600">
                        <SelectValue placeholder="Year" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="2024">2024</SelectItem>
                        <SelectItem value="2025">2025</SelectItem>
                    </SelectContent>
                </Select>
                <Select>
                    <SelectTrigger className="bg-gray-700 border-gray-600">
                        <SelectValue placeholder="Company" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="hezee">HEZEE</SelectItem>
                    </SelectContent>
                </Select>
                <Select>
                    <SelectTrigger className="bg-gray-700 border-gray-600">
                        <SelectValue placeholder="Department" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="eng">Engineering</SelectItem>
                    </SelectContent>
                </Select>
                 <Select>
                    <SelectTrigger className="bg-gray-700 border-gray-600">
                        <SelectValue placeholder="Location" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="main">Main Office</SelectItem>
                    </SelectContent>
                </Select>
                <Button className="bg-green-500 hover:bg-green-600 text-white col-span-2 md:col-span-1">
                    <Filter className="mr-2" />
                    Filter
                </Button>
            </div>
        </div>
    )
}
