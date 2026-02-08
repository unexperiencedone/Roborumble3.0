"use client";

import { useState } from "react";
import Image from "next/image";
import { X, ShieldAlert, DollarSign, Upload, CheckCircle, Loader2, Copy } from "lucide-react";
import { UploadButton } from "@/app/utils/uploadthing";
import { QRCodeSVG } from "qrcode.react";

interface NonRefundableDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
}

export function NonRefundableDialog({ isOpen, onClose, onConfirm }: NonRefundableDialogProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[10000] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-[#111] border border-red-500 rounded-xl max-w-md w-full p-6 shadow-[0_0_50px_rgba(255,0,0,0.3)] animate-in fade-in zoom-in duration-300">
                <div className="flex items-center gap-3 mb-4 text-red-500">
                    <ShieldAlert size={32} />
                    <h3 className="text-xl font-black font-mono uppercase tracking-wide">Warning: Protocol Alert</h3>
                </div>
                
                <div className="space-y-4 mb-6 text-zinc-300 font-mono text-sm leading-relaxed border-l-2 border-red-500/50 pl-4 py-2">
                    <p>
                        You are about to initiate a financial transaction for event registration.
                    </p>
                    <p className="text-white font-bold bg-red-500/10 p-2 rounded">
                        PLEASE NOTE: All registrations are strictly NON-REFUNDABLE.
                    </p>
                    <p>
                        Once payment is processed, no refund requests will be entertained under any circumstances. Ensure your team details are final before proceeding.
                    </p>
                </div>

                <div className="flex gap-3 pt-2">
                    <button
                        onClick={onClose}
                        className="flex-1 py-3 bg-zinc-900 border border-zinc-700 text-zinc-400 font-mono font-bold uppercase text-xs hover:bg-zinc-800 hover:text-white transition-all rounded"
                    >
                        Abort Mission
                    </button>
                    <button
                        onClick={onConfirm}
                        className="flex-[2] py-3 bg-red-600 text-white font-mono font-black uppercase text-xs hover:bg-red-500 transition-all rounded shadow-[0_0_20px_rgba(220,38,38,0.4)]"
                    >
                        Acknowledge & Proceed
                    </button>
                </div>
            </div>
        </div>
    );
}

interface ManualPaymentDialogProps {
    isOpen: boolean;
    onClose: () => void; // Should probably be disabled/hidden during process
    eventId: string;
    amount: number;
    onSubmit: (transactionId: string, screenshotUrl: string) => Promise<void>;
}

export function ManualPaymentDialog({ isOpen, onClose, eventId, amount, onSubmit }: ManualPaymentDialogProps) {
    const [transactionId, setTransactionId] = useState("");
    const [screenshotUrl, setScreenshotUrl] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    if (!isOpen) return null;

    const handleSubmit = async () => {
        if (!transactionId || !screenshotUrl) {
            setError("Please complete all fields and upload proof.");
            return;
        }
        
        setError("");
        setSubmitting(true);
        try {
            await onSubmit(transactionId, screenshotUrl);
        } catch (err: any) {
            setError(err.message || "Submission failed");
            setSubmitting(false);
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        // Could add toast here
    };

    return (
        <div className="fixed inset-0 z-[10001] bg-black/95 backdrop-blur-md flex items-center justify-center p-4">
            {/* Prevent closing by clicking outside to ensure flow completion */}
            <div className="bg-[#050505] border border-[#00F0FF] rounded-xl max-w-4xl w-full flex flex-col md:flex-row overflow-hidden shadow-[0_0_80px_rgba(0,240,255,0.15)] relative animate-in fade-in zoom-in duration-300 h-[80vh] md:h-auto">
                
                {/* Mobile Close (Only if we want to allow aborting during payment, usually better to allow exit) */}
                <button 
                    onClick={onClose}
                    className="absolute top-4 right-4 z-50 text-zinc-500 hover:text-white md:hidden"
                >
                    <X size={24} />
                </button>

                {/* Left: Payment Info & QR */}
                <div className="md:w-[40%] bg-zinc-900/50 p-6 md:p-8 flex flex-col border-b md:border-b-0 md:border-r border-white/10 relative overflow-hidden">
                    <div className="absolute inset-0 bg-grid-white/[0.02] bg-[length:20px_20px]" />
                    
                    <div className="relative z-10">
                        <h3 className="text-xl font-black text-[#00F0FF] font-mono mb-6 flex items-center gap-2">
                             <DollarSign size={24} /> PAYMENT_GATEWAY
                        </h3>

                        {/* MAINTAINER NOTE: QR Code is dynamically generated using UPI payment link
                            - UPI ID and Name are loaded from environment variables (NEXT_PUBLIC_UPI_ID, NEXT_PUBLIC_UPI_NAME)
                            - Amount is passed from the event registration
                            - Update .env.local with production UPI credentials before deployment
                            - DO NOT hardcode UPI details in source code for security
                        */}
                        <div className="bg-white p-4 rounded-lg shadow-xl mb-6 mx-auto max-w-[240px]">
                            <div className="aspect-square bg-gray-100 flex items-center justify-center relative overflow-hidden">
                                {/* Dynamic UPI QR Code */}
                                <QRCodeSVG
                                    value={`upi://pay?pa=${process.env.NEXT_PUBLIC_UPI_ID || 'roborumble@upi'}&pn=${encodeURIComponent(process.env.NEXT_PUBLIC_UPI_NAME || 'Robo Rumble 3.0')}&am=${amount}&cu=INR&tn=${encodeURIComponent('RoboRumble Event Registration')}`}
                                    size={200}
                                    level="H"
                                    includeMargin={false}
                                />
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-10">
                                    <div className="w-full h-[2px] bg-red-500 animate-[scan_2s_ease-in-out_infinite]" />
                                </div>
                            </div>
                            <p className="text-center text-black font-bold font-mono text-xs mt-2 uppercase tracking-wider">Scan to Pay</p>
                        </div>

                        <div className="space-y-4 font-mono text-sm">
                            <div className="flex justify-between items-center border-b border-white/10 pb-2">
                                <span className="text-zinc-500">Amount Due</span>
                                <span className="text-2xl font-bold text-white">₹{amount}</span>
                            </div>
                            <div className="space-y-1">
                                <span className="text-zinc-500 text-xs uppercase">UPI ID</span>
                                <div className="flex items-center justify-between bg-black/50 p-2 rounded border border-white/10">
                                    <span className="text-[#00F0FF]">{process.env.NEXT_PUBLIC_UPI_ID || 'roborumble@upi'}</span>
                                    <button onClick={() => copyToClipboard(process.env.NEXT_PUBLIC_UPI_ID || 'roborumble@upi')} className="text-zinc-400 hover:text-white">
                                        <Copy size={14} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right: Upload & Verification */}
                <div className="flex-1 p-6 md:p-8 bg-black relative flex flex-col">
                    <button 
                        onClick={onClose}
                        className="absolute top-4 right-4 text-zinc-500 hover:text-white hidden md:block"
                    >
                        <X size={24} />
                    </button>

                    <div className="mb-8">
                        <h3 className="text-xl font-black text-white font-mono uppercase tracking-wide mb-2">Verify Transaction</h3>
                        <p className="text-zinc-500 text-xs font-mono">
                            Upload proof of payment to finalize your registration slot.
                        </p>
                    </div>

                    <div className="space-y-6 flex-1 overflow-y-auto pr-2">
                        {error && (
                            <div className="p-3 bg-red-900/20 border border-red-500/50 text-red-500 text-xs font-mono rounded">
                                SYSTEM_ERROR: {error}
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-[#00F0FF] text-xs font-bold font-mono uppercase tracking-widest">Transaction ID / UTR</label>
                            <input
                                value={transactionId}
                                onChange={(e) => setTransactionId(e.target.value)}
                                placeholder="Enter 12-digit UTR number..."
                                className="w-full bg-zinc-900/50 border border-zinc-700 p-4 text-white font-mono focus:border-[#00F0FF] focus:bg-[#00F0FF]/5 outline-none transition-all rounded"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[#00F0FF] text-xs font-bold font-mono uppercase tracking-widest">Screenshot Proof</label>
                             
                            {screenshotUrl ? (
                                <div className="relative aspect-video w-full border border-green-500/50 rounded-lg overflow-hidden bg-green-500/5 group">
                                    <Image src={screenshotUrl} alt="Proof" fill className="object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[1px]">
                                        <div className="bg-black/80 px-4 py-2 rounded-full border border-green-500/50 flex items-center gap-2">
                                            <CheckCircle className="text-green-500" size={16} />
                                            <span className="text-green-500 text-xs font-mono font-bold">UPLOAD_VERIFIED</span>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => setScreenshotUrl("")}
                                        className="absolute top-2 right-2 p-1 bg-black/80 text-red-500 rounded hover:bg-red-500 hover:text-white transition-colors"
                                    >
                                        <X size={14} />
                                    </button>
                                </div>
                            ) : (
                                <div className="border border-dashed border-zinc-700 bg-zinc-900/30 rounded-lg p-8 flex flex-col items-center justify-center hover:border-zinc-500 transition-colors">
                                    <UploadButton
                                        endpoint="imageUploader"
                                        onClientUploadComplete={(res) => {
                                            if (res && res[0]) {
                                                setScreenshotUrl(res[0].url);
                                            }
                                        }}
                                        onUploadError={(error: Error) => {
                                            setError(error.message);
                                        }}
                                        appearance={{
                                            button: "bg-[#00F0FF] text-black font-black font-mono text-xs px-6 py-3 uppercase tracking-widest hover:bg-white transition-all w-auto",
                                            allowedContent: "text-zinc-500 text-[10px] font-mono mt-2"
                                        }}
                                        content={{
                                            button({ ready }) {
                                                if (ready) return <span className="flex items-center gap-2"><Upload size={14} /> UPLOAD SCREENSHOT</span>;
                                                return "INITIALIZING...";
                                            }
                                        }}
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="pt-6 border-t border-white/10 mt-auto">
                        <button
                            onClick={handleSubmit}
                            disabled={submitting || !transactionId || !screenshotUrl}
                            className="w-full py-4 bg-[#00F0FF] text-black font-black font-mono text-sm uppercase tracking-[0.2em] hover:bg-white hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-zinc-800 disabled:text-zinc-500 flex items-center justify-center gap-3 rounded"
                        >
                            {submitting ? (
                                <>
                                    <Loader2 className="animate-spin" size={18} />
                                    VERIFYING_PAYMENT...
                                </>
                            ) : (
                                <>
                                    SUBMIT_FOR_APPROVAL <CheckCircle size={18} />
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
