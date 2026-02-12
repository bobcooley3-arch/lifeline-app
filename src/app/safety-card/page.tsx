"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Globe, Phone, ShieldAlert, User, FileText, Droplet } from "lucide-react";

type Language = 'en' | 'es';

const content = {
    en: {
        title: "EMERGENCY MEDICAL CARD",
        subtitle: "Present to Police or Medical Personnel",
        nameLabel: "Full Name",
        citizenshipLabel: "Citizenship",
        passportLabel: "Passport Number",
        bloodLabel: "Blood Type",
        allergiesLabel: "Allergies",
        allergiesValue: "None Known",
        emergencyContactLabel: "IN CASE OF EMERGENCY",
        contactRelation: "Husband / Primary Contact",
        callButton: "CALL NOW",
        backButton: "Back to Dashboard",
        translateButton: "Translate to Spanish",
        medicalNotesLabel: "Medical Notes",
        medicalNotesValue: "No chronic conditions."
    },
    es: {
        title: "TARJETA MÉDICA DE EMERGENCIA",
        subtitle: "Presentar a Policía o Personal Médico",
        nameLabel: "Nombre Completo",
        citizenshipLabel: "Ciudadanía",
        passportLabel: "Número de Pasaporte",
        bloodLabel: "Grupo Sanguíneo",
        allergiesLabel: "Alergias",
        allergiesValue: "Ninguna Conocida",
        emergencyContactLabel: "EN CASO DE EMERGENCIA",
        contactRelation: "Esposo / Contacto Principal",
        callButton: "LLAMAR AHORA",
        backButton: "Volver al Panel",
        translateButton: "Traducir a Inglés",
        medicalNotesLabel: "Notas Médicas",
        medicalNotesValue: "Sin condiciones crónicas."
    }
};

export default function SafetyCard() {
    const [lang, setLang] = useState<Language>('en');
    const t = content[lang];

    const toggleLanguage = () => {
        setLang(prev => prev === 'en' ? 'es' : 'en');
    };

    return (
        <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-red-100 max-h-screen overflow-y-auto pb-20">
            {/* TOP BAR / NAVIGATION */}
            <header className="bg-red-600 text-white p-4 sticky top-0 z-50 shadow-md flex justify-between items-center">
                <Link href="/" className="flex items-center gap-2 font-bold hover:bg-red-700 px-3 py-2 rounded-lg transition-colors">
                    <ArrowLeft className="w-5 h-5" />
                    <span className="hidden md:inline">{t.backButton}</span>
                </Link>

                <button
                    onClick={toggleLanguage}
                    className="flex items-center gap-2 bg-white text-red-600 px-4 py-2 rounded-full font-bold text-sm shadow-sm hover:bg-red-50 transition-colors"
                >
                    <Globe className="w-4 h-4" />
                    {lang === 'en' ? 'ESPAÑOL' : 'ENGLISH'}
                </button>
            </header>

            <main className="max-w-2xl mx-auto p-6 md:p-8 space-y-8">

                {/* HEADER / TITLES */}
                <div className="text-center space-y-2 border-b-2 border-red-100 pb-6">
                    <div className="flex justify-center mb-4">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                            <ShieldAlert className="w-8 h-8 text-red-600" />
                        </div>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-black text-red-600 uppercase tracking-tight leading-tight">
                        {t.title}
                    </h1>
                    <p className="text-slate-500 font-medium text-lg">
                        {t.subtitle}
                    </p>
                </div>

                {/* IDENTITY CARD */}
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row gap-6 items-center md:items-start text-center md:text-left">
                    {/* PHOTO PLACEHOLDER */}
                    <div className="w-32 h-40 bg-slate-200 rounded-lg flex items-center justify-center border-2 border-white shadow-md shrink-0">
                        <User className="w-12 h-12 text-slate-400" />
                    </div>

                    {/* DETAILS */}
                    <div className="space-y-4 w-full">
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{t.nameLabel}</p>
                            <p className="text-2xl font-bold text-slate-900">SARAH CONNOR</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{t.passportLabel}</p>
                                <p className="text-lg font-mono font-medium text-slate-700">A12345678</p>
                            </div>
                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{t.citizenshipLabel}</p>
                                <p className="text-lg font-medium text-slate-700">USA</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-200">
                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{t.bloodLabel}</p>
                                <div className="flex items-center gap-2 justify-center md:justify-start mt-1">
                                    <Droplet className="w-5 h-5 text-red-600 fill-red-600" />
                                    <span className="text-xl font-black text-red-600">O+ (POS)</span>
                                </div>
                            </div>
                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{t.allergiesLabel}</p>
                                <p className="text-lg font-medium text-green-700 mt-1">{t.allergiesValue}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* MEDICAL NOTES */}
                <div className="bg-white border-l-4 border-blue-500 pl-4 py-2">
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">{t.medicalNotesLabel}</h3>
                    <p className="text-slate-700 font-medium">{t.medicalNotesValue}</p>
                </div>

                {/* EMERGENCY CONTACT - HERO SECTION */}
                <div className="bg-red-600 text-white rounded-2xl p-8 text-center shadow-lg shadow-red-900/20 transform md:hover:scale-[1.02] transition-transform">
                    <h2 className="text-red-100 font-bold tracking-widest text-sm uppercase mb-4">
                        {t.emergencyContactLabel}
                    </h2>

                    <div className="mb-6">
                        <p className="text-4xl font-black mb-1">MARK</p>
                        <p className="text-red-100 font-medium">{t.contactRelation}</p>
                    </div>

                    <a
                        href="tel:+15550199"
                        className="inline-flex items-center justify-center gap-3 bg-white text-red-600 px-8 py-4 rounded-xl font-black text-xl hover:bg-red-50 transition-colors w-full md:w-auto"
                    >
                        <Phone className="w-6 h-6 fill-red-600" />
                        {t.callButton}
                    </a>
                </div>

            </main>
        </div>
    );
}
