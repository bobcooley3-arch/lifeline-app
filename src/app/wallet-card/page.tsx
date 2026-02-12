"use client";

import { QrCode, Printer } from "lucide-react";

export default function WalletCard() {
    return (
        <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-8 font-sans">

            {/* INSTRUCTIONS (Hidden on Print) */}
            <div className="mb-8 text-center print:hidden space-y-4">
                <h1 className="text-2xl font-bold text-slate-800">Printable Wallet Card</h1>
                <p className="text-slate-600">Standard ID-1 Size (85.6mm x 54mm)</p>
                <button
                    onClick={() => window.print()}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-bold mx-auto transition-colors"
                >
                    <Printer className="w-5 h-5" />
                    Print Card
                </button>
            </div>

            {/* THE CARD */}
            <div
                className="w-[85.6mm] h-[54mm] bg-white border-2 border-black box-border flex flex-col items-center justify-center text-center p-4 relative outline outline-1 outline-slate-200"
                style={{ printColorAdjust: 'exact', WebkitPrintColorAdjust: 'exact' }}
            >
                {/* QR PLACEHOLDER */}
                <div className="w-16 h-16 bg-black flex items-center justify-center mb-1">
                    <QrCode className="text-white w-12 h-12" />
                </div>

                <div className="space-y-0.5">
                    <p className="text-[9px] font-black uppercase leading-tight">
                        IF FOUND: SCAN OR GO TO
                    </p>
                    <p className="text-[10px] font-mono font-bold">
                        lifeline.app/rescue
                    </p>

                    <div className="w-full h-px bg-black my-0.5" />

                    <p className="text-[9px] font-bold">
                        Emergency Contact: Mark
                    </p>
                    <p className="text-xs font-black">
                        +1-555-0199
                    </p>
                </div>

                {/* Metric Label */}
                <span className="absolute bottom-0.5 right-1 text-[6px] text-slate-300 font-mono">
                    85.6 x 54mm
                </span>
            </div>

            {/* CUTTING GUIDE (Visual Aid) */}
            <div className="mt-8 text-slate-400 text-xs print:hidden">
                * Borders represent cut lines.
            </div>

            <style jsx global>{`
                @media print {
                    @page {
                        margin: 0;
                        size: auto;
                    }
                    body {
                        background: white;
                    }
                    /* Center content on paper */
                    body > div {
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        height: 100vh;
                        margin: 0;
                        padding: 0;
                    }
                }
            `}</style>
        </div>
    );
}
