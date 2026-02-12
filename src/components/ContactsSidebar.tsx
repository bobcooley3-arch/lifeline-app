"use client";

import React from "react";
import { Phone, User, Star } from "lucide-react";

export const ContactsSidebar = () => {
    const contacts = [
        { id: 1, name: "Mark", role: "Primary Contact", status: "Active" },
        { id: 2, name: "Jane", role: "Legal Counsel", status: "Standby" },
    ];

    return (
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 w-full lg:w-80 h-fit">
            <div className="flex items-center gap-3 mb-6 border-b border-slate-800 pb-4">
                <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                <h2 className="text-lg font-bold text-slate-200">Emergency Contacts</h2>
            </div>

            <div className="space-y-4">
                {contacts.map((contact) => (
                    <div
                        key={contact.id}
                        className="flex items-center gap-4 p-3 bg-slate-950 rounded-xl border border-slate-800 hover:border-slate-700 transition-colors group cursor-pointer"
                    >
                        <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 group-hover:text-white transition-colors">
                            <User className="w-5 h-5" />
                        </div>

                        <div className="flex-1">
                            <h3 className="font-bold text-slate-200">{contact.name}</h3>
                            <p className="text-xs text-slate-500">{contact.role}</p>
                        </div>

                        <button className="w-8 h-8 rounded-full bg-green-900/30 flex items-center justify-center text-green-500 hover:bg-green-500 hover:text-white transition-all">
                            <Phone className="w-4 h-4" />
                        </button>
                    </div>
                ))}
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800 text-center">
                <p className="text-xs text-slate-600">
                    Contacts will be notified if timer hits 0.
                </p>
            </div>
        </div>
    );
};
