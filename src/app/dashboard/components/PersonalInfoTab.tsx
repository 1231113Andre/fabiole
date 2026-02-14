"use client";

import { PersonalInfo } from "../types";
import { calculateAge } from "@/lib/body-metrics";

interface PersonalInfoTabProps {
    personalInfo: PersonalInfo;
}

export function PersonalInfoTab({ personalInfo }: PersonalInfoTabProps) {
    return (
        <div className="space-y-6">
            {/* Main Identity Card */}
            <div className="rounded-2xl border border-stroke bg-white shadow-default p-6">
                <div className="flex items-center gap-4 mb-6 border-b border-stroke pb-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <i className="fa-duotone fa-id-card text-xl"></i>
                    </div>
                    <h3 className="text-xl font-bold text-black">
                        Informações Pessoais
                    </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Name */}
                    <div className="flex flex-col gap-1">
                        <span className="text-xs font-medium text-slate-500 uppercase flex items-center gap-2">
                            <i className="fa-duotone fa-user text-primary/70"></i>
                            Nome Completo
                        </span>
                        <span className="text-lg font-semibold text-black pl-6">
                            {personalInfo.name} {personalInfo.surname}
                        </span>
                    </div>

                    {/* Email */}
                    <div className="flex flex-col gap-1">
                        <span className="text-xs font-medium text-slate-500 uppercase flex items-center gap-2">
                            <i className="fa-duotone fa-envelope text-primary/70"></i>
                            Email
                        </span>
                        <span className="text-lg font-semibold text-black pl-6">
                            {personalInfo.email}
                        </span>
                    </div>

                    {/* Phone */}
                    <div className="flex flex-col gap-1">
                        <span className="text-xs font-medium text-slate-500 uppercase flex items-center gap-2">
                            <i className="fa-duotone fa-phone text-primary/70"></i>
                            Telefone
                        </span>
                        <span className="text-lg font-semibold text-black pl-6">
                            {personalInfo.phone || 'N/A'}
                        </span>
                    </div>

                    {/* Birth Date */}
                    <div className="flex flex-col gap-1">
                        <span className="text-xs font-medium text-slate-500 uppercase flex items-center gap-2">
                            <i className="fa-duotone fa-calendar-day text-primary/70"></i>
                            Data de Nascimento
                        </span>
                        <span className="text-lg font-semibold text-black pl-6">
                            {personalInfo.birthDate}
                        </span>
                    </div>

                    {/* Age (Calculated from birth date) */}
                    <div className="flex flex-col gap-1">
                        <span className="text-xs font-medium text-slate-500 uppercase flex items-center gap-2">
                            <i className="fa-duotone fa-cake-candles text-primary/70"></i>
                            Idade
                        </span>
                        <span className="text-lg font-semibold text-black pl-6">
                            {(() => {
                                const age = personalInfo.birthDate ? calculateAge(personalInfo.birthDate) : null;
                                return age !== null ? `${age} Anos` : 'N/A';
                            })()}
                        </span>
                    </div>
                </div>
            </div>

            {/* Quarterly Data */}
            {(personalInfo?.q1 || personalInfo?.q2 || personalInfo?.q3 || personalInfo?.q4) && (
                <div className="rounded-2xl border border-stroke bg-white shadow-default p-6">
                    <div className="flex items-center gap-4 mb-6 border-b border-stroke pb-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                            <i className="fa-duotone fa-chart-pie text-xl"></i>
                        </div>
                        <h3 className="text-xl font-bold text-black">
                            Dados Trimestrais
                        </h3>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {personalInfo.q1 && (
                            <div className="flex flex-col items-center justify-center rounded-xl border border-blue-100 bg-blue-50/30 py-4 px-2 text-center transition-all hover:bg-blue-50 hover:shadow-sm">
                                <span className="text-xs font-bold text-blue-600 uppercase mb-2 bg-blue-100 px-2 py-0.5 rounded-full">Q1</span>
                                <span className="text-xl font-bold text-slate-800">{personalInfo.q1}</span>
                            </div>
                        )}
                        {personalInfo.q2 && (
                            <div className="flex flex-col items-center justify-center rounded-xl border border-emerald-100 bg-emerald-50/30 py-4 px-2 text-center transition-all hover:bg-emerald-50 hover:shadow-sm">
                                <span className="text-xs font-bold text-emerald-600 uppercase mb-2 bg-emerald-100 px-2 py-0.5 rounded-full">Q2</span>
                                <span className="text-xl font-bold text-slate-800">{personalInfo.q2}</span>
                            </div>
                        )}
                        {personalInfo.q3 && (
                            <div className="flex flex-col items-center justify-center rounded-xl border border-amber-100 bg-amber-50/30 py-4 px-2 text-center transition-all hover:bg-amber-50 hover:shadow-sm">
                                <span className="text-xs font-bold text-amber-600 uppercase mb-2 bg-amber-100 px-2 py-0.5 rounded-full">Q3</span>
                                <span className="text-xl font-bold text-slate-800">{personalInfo.q3}</span>
                            </div>
                        )}
                        {personalInfo.q4 && (
                            <div className="flex flex-col items-center justify-center rounded-xl border border-purple-100 bg-purple-50/30 py-4 px-2 text-center transition-all hover:bg-purple-50 hover:shadow-sm">
                                <span className="text-xs font-bold text-purple-600 uppercase mb-2 bg-purple-100 px-2 py-0.5 rounded-full">Q4</span>
                                <span className="text-xl font-bold text-slate-800">{personalInfo.q4}</span>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Goals and Notes */}
            {(personalInfo?.goals || personalInfo?.notes) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {personalInfo.goals && (
                        <div className="rounded-2xl border border-stroke bg-white shadow-default p-6 flex flex-col h-full">
                            <div className="flex items-center gap-3 mb-4 border-b border-stroke pb-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-50 text-rose-500">
                                    <i className="fa-duotone fa-bullseye-arrow text-lg"></i>
                                </div>
                                <h3 className="text-lg font-bold text-black">Objetivos</h3>
                            </div>
                            <div className="flex-grow">
                                <p className="text-sm text-slate-600 whitespace-pre-wrap leading-relaxed">{personalInfo.goals}</p>
                            </div>
                        </div>
                    )}
                    {personalInfo.notes && (
                        <div className="rounded-2xl border border-stroke bg-white shadow-default p-6 flex flex-col h-full">
                            <div className="flex items-center gap-3 mb-4 border-b border-stroke pb-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-50 text-orange-500">
                                    <i className="fa-duotone fa-clipboard-list-check text-lg"></i>
                                </div>
                                <h3 className="text-lg font-bold text-black">Notas do Personal Trainer</h3>
                            </div>
                            <div className="flex-grow">
                                <p className="text-sm text-slate-600 whitespace-pre-wrap leading-relaxed">{personalInfo.notes}</p>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
