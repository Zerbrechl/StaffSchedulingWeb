'use client';

import {useState} from 'react';
import {useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {z} from 'zod';
import {Button} from '@/components/ui/button';
import {Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage,} from '@/components/ui/form';
import {useSearchParams} from 'next/navigation';
import {Calendar as CalendarIcon, User} from 'lucide-react';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {EmployeeSelector} from '@/components/employee-selector';
import {parseMonthYear} from '@/lib/utils/case-utils';
import {DayData, InteractiveCalendar} from '@/components/InteractiveCalendar';
import type {Employee} from '@/src/entities/models/employee.model';
import type {AvailabilityEmployee} from '@/src/entities/models/availability.model';

const availabilitySchema = z.object({
    employeeKey: z.number().min(1, {
        message: 'Bitte wähle einen Mitarbeiter aus.',
    }),
});

type AvailabilityFormValues = z.infer<typeof availabilitySchema>;

interface AvailabilityFormProps {
    employee?: AvailabilityEmployee;
    onSubmit: (data: AvailabilityEmployee) => void;
    onCancel: () => void;
    isSubmitting?: boolean;
    excludedEmployeeKeys?: number[];
    isGlobal?: boolean;
    caseId?: number;
    monthYear?: string;
}

function convertToDayData(
    year: number,
    month: number,
    availableDays: number[],
    unavailableDays: number[]
): DayData[] {
    const dayDataMap = new Map<number, DayData>();

    availableDays.forEach((day) => {
        const date = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        dayDataMap.set(day, {
            date,
            categoryId: 'available',
            events: [],
        });
    });

    unavailableDays.forEach((day) => {
        const date = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        dayDataMap.set(day, {
            date,
            categoryId: 'unavailable',
            events: [],
        });
    });

    return Array.from(dayDataMap.values());
}

function convertFromDayData(dayData: DayData[]): {
    availableDays: number[];
    unavailableDays: number[];
} {
    const availableDays: number[] = [];
    const unavailableDays: number[] = [];

    dayData.forEach((data) => {
        const day = parseInt(data.date.split('-')[2], 10);

        if (data.categoryId === 'available') {
            availableDays.push(day);
        } else if (data.categoryId === 'unavailable') {
            unavailableDays.push(day);
        }
    });

    availableDays.sort((a, b) => a - b);
    unavailableDays.sort((a, b) => a - b);

    return {availableDays, unavailableDays};
}

export function AvailabilityForm({
                                     employee,
                                     onSubmit,
                                     onCancel,
                                     isSubmitting,
                                     excludedEmployeeKeys = [],
                                     isGlobal,
                                     caseId,
                                     monthYear,
                                 }: AvailabilityFormProps) {
    const searchParams = useSearchParams();
    const monthYearStr = monthYear ?? searchParams.get('monthYear') ?? '';
    const {month: urlMonth, year: urlYear} = monthYearStr
        ? parseMonthYear(monthYearStr)
        : {month: new Date().getMonth() + 1, year: new Date().getFullYear()};
    const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(() =>
        employee ? {
            key: employee.key,
            firstname: employee.firstname,
            name: employee.name,
            type: '',
        } as Employee : null
    );

    const form = useForm<AvailabilityFormValues>({
        resolver: zodResolver(availabilitySchema),
        defaultValues: {
            employeeKey: employee?.key || 0,
        },
    });

    const year = urlYear;
    const month = urlMonth;
    const daysInMonth = new Date(year, month, 0).getDate();
    const dayCount = isGlobal ? 7 : daysInMonth;
    const [calendarData, setCalendarData] = useState<DayData[]>(() =>
        convertToDayData(
            year,
            month,
            employee?.availability_days || [],
            employee?.unavailability_days || []
        )
    );
    const {availableDays, unavailableDays} = convertFromDayData(calendarData);
    const neutralDaysCount = dayCount - availableDays.length - unavailableDays.length;
    const dayCategories = [
        {id: 'available', name: 'Verfügbar', color: '#bbf7d0'},
        {id: 'unavailable', name: 'Nicht verfügbar', color: '#fecaca'},
    ];

    const handleFormSubmit = () => {
        if (!selectedEmployee) return;

        onSubmit({
            key: selectedEmployee.key,
            firstname: selectedEmployee.firstname,
            name: selectedEmployee.name,
            availability_days: availableDays,
            unavailability_days: unavailableDays,
        });
    };

    const handleEmployeeSelect = (emp: Employee | null) => {
        setSelectedEmployee(emp);
        form.setValue('employeeKey', emp?.key || 0);
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    <Card className="min-w-0">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-base">
                                <User className="h-5 w-5"/>
                                Mitarbeiter auswählen
                            </CardTitle>
                            <CardDescription>
                                Suche und wähle einen Mitarbeiter aus der Mitarbeiterdatenbank
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <FormField
                                control={form.control}
                                name="employeeKey"
                                render={({field}) => (
                                    <FormItem>
                                        <FormLabel>Mitarbeiter</FormLabel>
                                        <FormControl>
                                            <EmployeeSelector
                                                value={field.value || undefined}
                                                onSelect={handleEmployeeSelect}
                                                disabled={!!employee || isSubmitting}
                                                excludedKeys={employee ? [] : excludedEmployeeKeys}
                                                caseId={caseId}
                                                monthYear={monthYearStr}
                                            />
                                        </FormControl>
                                        {employee && (
                                            <FormDescription>
                                                Mitarbeiter können beim Bearbeiten nicht geändert werden.
                                            </FormDescription>
                                        )}
                                        <FormMessage/>
                                    </FormItem>
                                )}
                            />

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t">
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-green-600">{availableDays.length}</div>
                                    <div className="text-xs text-muted-foreground">Verfügbare Tage</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-red-600">{unavailableDays.length}</div>
                                    <div className="text-xs text-muted-foreground">Nicht verfügbare Tage</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-slate-500">{neutralDaysCount}</div>
                                    <div className="text-xs text-muted-foreground">Neutrale Tage</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="min-w-0">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-base">
                                <CalendarIcon className="h-5 w-5"/>
                                {isGlobal ? `Wochenkalender` : `Monatskalender`}
                            </CardTitle>
                            <CardDescription>
                                Klicke auf einen Tag, um Verfügbarkeit zu verwalten
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <InteractiveCalendar
                                month={month}
                                year={year}
                                categories={dayCategories}
                                eventCategories={[]}
                                initialDayData={calendarData}
                                onDayDataChange={setCalendarData}
                                showLegend={true}
                                showCategoryTitle={false}
                                view={isGlobal ? 'week' : 'month'}
                                allowedEventTitles={[]}
                            />
                        </CardContent>
                    </Card>
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onCancel}
                        disabled={isSubmitting}
                    >
                        Abbrechen
                    </Button>
                    <Button
                        type="submit"
                        disabled={isSubmitting || (!employee && !selectedEmployee)}
                    >
                        {isSubmitting ? 'Speichern...' : 'Speichern'}
                    </Button>
                </div>
            </form>
        </Form>
    );
}
