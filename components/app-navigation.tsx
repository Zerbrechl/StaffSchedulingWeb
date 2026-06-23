'use client';

import {usePathname, useSearchParams} from 'next/navigation';
import Link from 'next/link';
import {MonthSelector} from '@/components/month-selector';
import {Separator} from '@/components/ui/separator';
import {Button} from '@/components/ui/button';
import {DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,} from '@/components/ui/dropdown-menu';
import {Briefcase, Calendar, CalendarCheck, ChevronDown, Cog, FileText, Heart, Scale, UserCog} from 'lucide-react';
import {cn} from '@/lib/utils';
// This wrapper is required because AppNavigation uses useSearchParams, a client hook.
// During SSR/prerendering it must be rendered inside a Suspense boundary.
import {Suspense} from 'react';

interface AppNavigationProps {
    isLocked: boolean;
    lockedCaseId?: number | null;
    lockedMonthYear?: string | null;
}

export function AppNavigation({isLocked, lockedCaseId, lockedMonthYear}: AppNavigationProps) {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const caseId = searchParams.get('caseId');
    const caseIds = searchParams.get('caseIds');
    const monthYear = searchParams.get('monthYear');
    const caseSearch = caseId && monthYear
        ? `?caseId=${caseId}${caseIds ? `&caseIds=${caseIds}` : ''}&monthYear=${monthYear}`
        : '';

    const isActive = (path: string) => {
        return pathname === path || pathname.startsWith(path + '/');
    };

    return (
        <div className="border-b bg-background sticky top-0 z-50">
            <div className="container mx-auto px-4">
                <div className="flex flex-wrap items-center justify-between gap-4 py-2 min-h-16">
                    {/* Logo/Brand */}
                    <Link href={`/${caseSearch}`}
                          className="flex items-center gap-2 min-w-fit hover:opacity-80 transition-opacity">
                        <Briefcase className="h-6 w-6"/>
                        <span className="font-semibold text-lg hidden sm:inline">
              Schichtplan Manager
            </span>
                    </Link>

                    {/* Navigation links */}
                    <div className="flex flex-wrap items-center gap-1 flex-1 min-w-0">
                        {/* Employees */}
                        <Button
                            variant="ghost"
                            asChild
                            className={cn(isActive('/employees') && 'bg-accent')}
                        >
                            <Link href={`/employees${caseSearch}`} className="gap-2">
                                <Calendar className="h-4 w-4"/>
                                Mitarbeiter
                            </Link>
                        </Button>


                        {/* Wishes dropdown */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="ghost"
                                    className={cn(
                                        'gap-1',
                                        (isActive('/global-wishes-and-blocked') || isActive('/wishes-and-blocked')) && 'bg-accent'
                                    )}
                                >
                                    <Heart className="h-4 w-4"/>
                                    <span>Wünsche</span>
                                    <ChevronDown className="h-3 w-3"/>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start">
                                <DropdownMenuItem asChild>
                                    <Link href={`/global-wishes-and-blocked${caseSearch}`}
                                          className="flex items-center gap-2 cursor-pointer">
                                        <Heart className="h-4 w-4"/>
                                        Globale Wünsche
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                    <Link href={`/wishes-and-blocked${caseSearch}`}
                                          className="flex items-center gap-2 cursor-pointer">
                                        <Heart className="h-4 w-4"/>
                                        Wünsche diesen Monat
                                    </Link>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        {/* Availability dropdown */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="ghost"
                                    className={cn(
                                        'gap-1',
                                        (isActive('/global-availability') || isActive('/availability')) && 'bg-accent'
                                    )}
                                >
                                    <CalendarCheck className="h-4 w-4"/>
                                    <span>Availability</span>
                                    <ChevronDown className="h-3 w-3"/>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start">
                                <DropdownMenuItem asChild>
                                    <Link href={`/global-availability${caseSearch}`}
                                          className="flex items-center gap-2 cursor-pointer">
                                        <CalendarCheck className="h-4 w-4"/>
                                        Global Availability
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                    <Link href={`/availability${caseSearch}`}
                                          className="flex items-center gap-2 cursor-pointer">
                                        <CalendarCheck className="h-4 w-4"/>
                                        Availability für den Monat
                                    </Link>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>


                        {/* Configuration dropdown */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="ghost"
                                    className={cn(
                                        'gap-1',
                                        (isActive('/weights') || isActive('/minimal-staff')) && 'bg-accent'
                                    )}
                                >
                                    <Cog className="h-4 w-4"/>
                                    <span className="hidden sm:inline">Konfiguration</span>
                                    <span className="sm:hidden">Config</span>
                                    <ChevronDown className="h-3 w-3"/>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start">
                                <DropdownMenuItem asChild>
                                    <Link href={`/weights${caseSearch}`}
                                          className="flex items-center gap-2 cursor-pointer">
                                        <Scale className="h-4 w-4"/>
                                        Gewichtungen
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                    <Link href={`/minimal-staff${caseSearch}`}
                                          className="flex items-center gap-2 cursor-pointer">
                                        <UserCog className="h-4 w-4"/>
                                        Mindestbesetzung
                                    </Link>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        {/* Schedule */}
                        <Button
                            variant="ghost"
                            asChild
                            className={cn(isActive('/schedule') && 'bg-accent')}
                        >
                            <Link href={`/schedule${caseSearch}`} className="gap-2">
                                <Calendar className="h-4 w-4"/>
                                Dienstplan
                            </Link>
                        </Button>


                        {/* Solver */}
                        <Button
                            variant="ghost"
                            asChild
                            className={cn(isActive('/solver') && 'bg-accent')}
                        >
                            <Link href={`/solver${caseSearch}`} className="gap-2">
                                <Cog className="h-4 w-4"/>
                                Solver
                            </Link>
                        </Button>

                        {/* Templates dropdown */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="ghost"
                                    className={cn(
                                        'gap-1',
                                        (isActive('/templates') || isActive('/templates/weights')) && 'bg-accent'
                                    )}
                                >
                                    <FileText className="h-4 w-4"/>
                                    <span className="hidden sm:inline">Templates</span>
                                    <ChevronDown className="h-3 w-3"/>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start">
                                <DropdownMenuItem asChild>
                                    <Link href={`/templates${caseSearch}`}
                                          className="flex items-center gap-2 cursor-pointer">
                                        <FileText className="h-4 w-4"/>
                                        Alle Templates
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                    <Link href={`/templates/weights${caseSearch}`}
                                          className="flex items-center gap-2 cursor-pointer">
                                        <Scale className="h-4 w-4"/>
                                        Gewichtungs-Templates
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                    <Link href={`/templates/global-wishes${caseSearch}`}
                                          className="flex items-center gap-2 cursor-pointer">
                                        <Heart className="h-4 w-4"/>
                                        Wünsche-Templates
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                    <Link href={`/templates/minimal-staff${caseSearch}`}
                                          className="flex items-center gap-2 cursor-pointer">
                                        <UserCog className="h-4 w-4"/>
                                        Mindestbesetzung-Templates
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                    <Link href={`/templates/availability${caseSearch}`}
                                          className="flex items-center gap-2 cursor-pointer">
                                        <CalendarCheck className="h-4 w-4"/>
                                        Availability-Templates
                                    </Link>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>

                    <Separator orientation="vertical" className="mx-2 h-8 w-px bg-border shrink-0"/>

                    {/* Month/case selector */}
                    <div className="w-full flex justify-start lg:w-auto lg:justify-end">
                        <MonthSelector
                            disabled={isLocked}
                            lockedCaseId={lockedCaseId}
                            lockedMonthYear={lockedMonthYear}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

interface NavigationWrapperProps {
    isLocked: boolean;
    lockedCaseId?: number | null;
    lockedMonthYear?: string | null;
}

export function NavigationWrapper({isLocked, lockedCaseId, lockedMonthYear}: NavigationWrapperProps) {
    return (
        <Suspense fallback={<div className="h-16 border-b bg-background sticky top-0 z-50"/>}>
            <AppNavigation isLocked={isLocked} lockedCaseId={lockedCaseId} lockedMonthYear={lockedMonthYear} />
        </Suspense>
    );
}
