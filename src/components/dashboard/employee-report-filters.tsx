
'use client';

import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Filter } from "lucide-react";

export default function EmployeeReportFilters() {
    return (
        <div className="flex flex-wrap items-center gap-4 rounded-lg bg-card border p-4 shadow-sm">
            <h3 className="text-base font-semibold">Employee Report</h3>
            <div className="flex-grow grid grid-cols-2 md:grid-cols-5 gap-4">
                <Select>
                    <SelectTrigger>
                        <SelectValue placeholder="Month" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="aug">August</SelectItem>
                        <SelectItem value="sep">September</SelectItem>
                    </SelectContent>
                </Select>
                <Select>
                    <SelectTrigger>
                        <SelectValue placeholder="Year" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="2024">2024</SelectItem>
                        <SelectItem value="2025">2025</SelectItem>
                    </SelectContent>
                </Select>
                <Select>
                    <SelectTrigger>
                        <SelectValue placeholder="Company" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="hezee">HEZEE</SelectItem>
                    </SelectContent>
                </Select>
                <Select>
                    <SelectTrigger>
                        <SelectValue placeholder="Department" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="eng">Engineering</SelectItem>
                    </SelectContent>
                </Select>
                 <Select>
                    <SelectTrigger>
                        <SelectValue placeholder="Location" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="main">Main Office</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <Button>
                <Filter className="mr-2" />
                Filter
            </Button>
        </div>
    )
}
