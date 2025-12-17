"use client";

import { PersonalInfo } from "../types";

interface PersonalInfoTabProps {
    personalInfo: PersonalInfo;
}

export function PersonalInfoTab({ personalInfo }: PersonalInfoTabProps) {
    return (
        <div className="space-y-6">
            <div className="rounded-sm border border-stroke bg-white shadow-default">
                <div className="border-b border-stroke py-4 px-7">
                    <h3 className="font-medium text-black">
                        Informações Pessoais
                    </h3>
                </div>
                <div className="p-7">
                    <div className="mb-5.5 flex flex-col gap-5.5 sm:flex-row">
                        <div className="w-full sm:w-1/2">
                            <label className="mb-3 block text-sm font-medium text-black">
                                Nome Completo
                            </label>
                            <div className="w-full rounded border border-stroke bg-gray-2 py-3 px-4.5 text-black focus:border-primary focus-visible:outline-none">
                                {personalInfo.name}
                            </div>
                        </div>
                        <div className="w-full sm:w-1/2">
                            <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                                Email
                            </label>
                            <div className="w-full rounded border border-stroke bg-gray py-3 px-4.5 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary">
                                {personalInfo.email}
                            </div>
                        </div>
                    </div>

                    <div className="mb-5.5 flex flex-col gap-5.5 sm:flex-row">
                        <div className="w-full sm:w-1/2">
                            <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                                Data de Nascimento
                            </label>
                            <div className="w-full rounded border border-stroke bg-gray py-3 px-4.5 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary">
                                {personalInfo.birthDate}
                            </div>
                        </div>
                        <div className="w-full sm:w-1/2">
                            <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                                Telefone
                            </label>
                            <div className="w-full rounded border border-stroke bg-gray py-3 px-4.5 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary">
                                {personalInfo.phone || 'N/A'}
                            </div>
                        </div>
                    </div>
                    {(personalInfo?.q1 || personalInfo?.q2 || personalInfo?.q3 || personalInfo?.q4) && (
                        <div className="mt-6">
                            <h4 className="mb-4 text-base font-semibold text-black">
                                Dados Trimestrais
                            </h4>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                {personalInfo.q1 && (
                                    <div className="rounded border border-stroke bg-gray-2 py-4 px-6 text-center">
                                        <span className="block text-xs font-medium uppercase text-slate-500 mb-1">Q1</span>
                                        <span className="text-xl font-bold text-black">{personalInfo.q1}</span>
                                    </div>
                                )}
                                {personalInfo.q2 && (
                                    <div className="rounded border border-stroke bg-gray py-4 px-6 text-center dark:border-strokedark dark:bg-meta-4">
                                        <span className="block text-xs font-medium uppercase text-slate-500 mb-1">Q2</span>
                                        <span className="text-xl font-bold text-black dark:text-white">{personalInfo.q2}</span>
                                    </div>
                                )}
                                {personalInfo.q3 && (
                                    <div className="rounded border border-stroke bg-gray py-4 px-6 text-center dark:border-strokedark dark:bg-meta-4">
                                        <span className="block text-xs font-medium uppercase text-slate-500 mb-1">Q3</span>
                                        <span className="text-xl font-bold text-black dark:text-white">{personalInfo.q3}</span>
                                    </div>
                                )}
                                {personalInfo.q4 && (
                                    <div className="rounded border border-stroke bg-gray py-4 px-6 text-center dark:border-strokedark dark:bg-meta-4">
                                        <span className="block text-xs font-medium uppercase text-slate-500 mb-1">Q4</span>
                                        <span className="text-xl font-bold text-black dark:text-white">{personalInfo.q3}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {(personalInfo?.goals || personalInfo?.notes) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                    {personalInfo.goals && (
                        <div className="rounded-sm border border-stroke bg-white shadow-default">
                            <div className="border-b border-stroke py-4 px-6.5">
                                <h3 className="font-medium text-black flex items-center gap-2">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                                        <i className="fas fa-bullseye text-primary text-sm"></i>
                                    </div>
                                    Objetivos
                                </h3>
                            </div>
                            <div className="p-6.5">
                                <p className="text-sm text-black whitespace-pre-wrap">{personalInfo.goals}</p>
                            </div>
                        </div>
                    )}
                    {personalInfo.notes && (
                        <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
                            <div className="border-b border-stroke py-4 px-6.5 dark:border-strokedark">
                                <h3 className="font-medium text-black dark:text-white flex items-center gap-2">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                                        <i className="fas fa-clipboard-list text-primary text-sm"></i>
                                    </div>
                                    Notas do Personal Trainer
                                </h3>
                            </div>
                            <div className="p-6.5">
                                <p className="text-sm text-black dark:text-white whitespace-pre-wrap">{personalInfo.notes}</p>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
