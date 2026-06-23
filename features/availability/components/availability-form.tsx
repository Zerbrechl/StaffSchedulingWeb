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

const weekDays = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];
const monthNames = [
    'Januar',
    'Februar',
    'März',
    'April',
    'Mai',
    'Juni',
    'Juli',
    'August',
    'September',
    'Oktober',
    'November',
    'Dezember',
];

function getFirstDayOfMonth(month: number, year: number) {
    const day = new Date(year, month - 1, 1).getDay();
    return day === 0 ? 6 : day - 1;
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
    const [selectedDays, setSelectedDays] = useState<number[]>(() =>
        employee
            ? [...employee.availability_days].sort((a, b) => a - b)
            : Array.from({length: dayCount}, (_, index) => index + 1)
    );

    const handleFormSubmit = () => {
        if (!selectedEmployee) return;

        onSubmit({
            key: selectedEmployee.key,
            firstname: selectedEmployee.firstname,
            name: selectedEmployee.name,
            availability_days: selectedDays,
        });
    };

    const handleEmployeeSelect = (emp: Employee | null) => {
        setSelectedEmployee(emp);
        form.setValue('employeeKey', emp?.key || 0);
    };

    const toggleDay = (day: number) => {
        setSelectedDays((current) => {
            const next = current.includes(day)
                ? current.filter((value) => value !== day)
                : Array.from(new Set([...current, day]));

            return next.sort((a, b) => a - b);
        });
    };

    const leadingEmptyDays = isGlobal ? 0 : getFirstDayOfMonth(month, year);
    const calendarDays = Array.from({length: dayCount}, (_, index) => index + 1);

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

                            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-green-600">{selectedDays.length}</div>
                                    <div className="text-xs text-muted-foreground">Verfügbare Tage</div>
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
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-center">
                                        {isGlobal ? 'Musterwoche' : `${monthNames[month - 1]} ${year}`}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-7 gap-2">
                                        {weekDays.map((day) => (
                                            <div key={day} className="text-center p-2 font-medium">
                                                {day}
                                            </div>
                                        ))}

                                        {Array.from({length: leadingEmptyDays}, (_, index) => (
                                            <div
                                                key={`empty-${index}`}
                                                className="border rounded-lg p-2 text-left relative min-h-24 flex flex-col opacity-30 bg-gray-50"
                                            />
                                        ))}

                                        {calendarDays.map((day) => {
                                            const selected = selectedDays.includes(day);

                                            return (
                                                <button
                                                    key={day}
                                                    type="button"
                                                    onClick={() => toggleDay(day)}
                                                    disabled={isSubmitting}
                                                    className={[
                                                        'border rounded-lg p-2 text-left relative min-h-24 flex flex-col transition-colors',
                                                        selected
                                                            ? 'border-green-500 bg-green-200 text-green-950'
                                                            : 'hover:border-gray-400 bg-transparent',
                                                    ].join(' ')}
                                                >
                                                    <div className="mb-1">{isGlobal ? weekDays[day - 1] : day}</div>
                                                    {selected && (
                                                        <div className="text-xs mt-auto pt-1 truncate opacity-80">
                                                        </div>
                                                    )}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </CardContent>
                            </Card>
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
