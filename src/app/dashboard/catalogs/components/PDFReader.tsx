'use client';

import React, { useState, useEffect, useRef, forwardRef } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import HTMLFlipBook from 'react-pageflip';
import {
    ChevronLeft,
    ChevronRight,
    ZoomIn,
    ZoomOut,
    Maximize,
    Minimize,
    X,
    Loader2,
    Settings,
    MoreHorizontal
} from 'lucide-react';

// Path for pdf worker - using local file for maximum stability
pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

interface PDFReaderProps {
    fileUrl: string;
    onClose: () => void;
    title: string;
}

// Wrapping Page component to work with forwarding ref for react-pageflip
const PageElement = forwardRef<HTMLDivElement, any>((props, ref) => {
    return (
        <div ref={ref} className="page-content bg-white shadow-2xl relative">
            {props.children}
        </div>
    );
});

PageElement.displayName = 'PageElement';

export default function PDFReader({ fileUrl, onClose, title }: PDFReaderProps) {
    const [numPages, setNumPages] = useState<number | null>(null);
    const [pageNumber, setPageNumber] = useState(1);
    const [scale, setScale] = useState(1.0);
    const [loading, setLoading] = useState(true);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const bookRef = useRef<any>(null);

    const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
        setNumPages(numPages);
        setLoading(false);
    };

    const handleZoomIn = () => setScale(prev => Math.min(prev + 0.2, 3.0));
    const handleZoomOut = () => setScale(prev => Math.max(prev - 0.2, 0.5));

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
            setIsFullscreen(true);
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
                setIsFullscreen(false);
            }
        }
    };

    // Auto cleanup worker on unmount
    useEffect(() => {
        return () => {
            if (isFullscreen && document.fullscreenElement) {
                document.exitFullscreen();
            }
        };
    }, [isFullscreen]);

    return (
        <div className="fixed inset-0 z-[200] bg-zinc-950 flex flex-col animate-in fade-in duration-500 overflow-hidden font-jakarta">
            {/* Header / Toolbar */}
            <div className="h-20 bg-zinc-900/80 backdrop-blur-xl border-b border-white/5 px-8 flex items-center justify-between z-10">
                <div className="flex items-center gap-6">
                    <button
                        onClick={onClose}
                        className="p-3 hover:bg-white/10 rounded-2xl text-white/50 hover:text-white transition-all group"
                    >
                        <X size={24} strokeWidth={3} className="group-active:scale-90 transition-transform" />
                    </button>
                    <div className="h-8 w-px bg-white/10"></div>
                    <div>
                        <h2 className="text-sm font-black text-white/90 tracking-tight line-clamp-1">{title}</h2>
                        <p className="text-[10px] font-bold text-red-500 uppercase tracking-[0.2em] mt-0.5">Premium Reader Mode</p>
                    </div>
                </div>

                <div className="flex items-center gap-4 bg-zinc-800/50 p-1.5 rounded-2xl border border-white/5">
                    <button onClick={handleZoomOut} className="p-2.5 hover:bg-white/10 rounded-xl text-white/60 hover:text-white transition-all">
                        <ZoomOut size={20} strokeWidth={2.5} />
                    </button>
                    <span className="text-[10px] font-black text-white px-2 min-w-16 text-center uppercase tracking-widest bg-zinc-900 py-2 rounded-lg">
                        {Math.round(scale * 100)}%
                    </span>
                    <button onClick={handleZoomIn} className="p-2.5 hover:bg-white/10 rounded-xl text-white/60 hover:text-white transition-all">
                        <ZoomIn size={20} strokeWidth={2.5} />
                    </button>
                </div>

                <div className="flex items-center gap-4">
                    <button onClick={toggleFullscreen} className="p-3 bg-zinc-800/50 hover:bg-red-600 rounded-2xl text-white transition-all border border-white/5">
                        {isFullscreen ? <Minimize size={22} strokeWidth={2.5} /> : <Maximize size={22} strokeWidth={2.5} />}
                    </button>
                </div>
            </div>

            {/* Reading Area */}
            <div className="flex-1 relative flex items-center justify-center bg-[#1a1a1a] p-4 md:p-10">
                {loading && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 z-50 bg-zinc-950">
                        <div className="w-16 h-16 border-4 border-red-900/30 border-t-red-600 rounded-full animate-spin"></div>
                        <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.4em]">Optimizing Viewport...</p>
                    </div>
                )}

                <Document
                    file={fileUrl}
                    onLoadSuccess={onDocumentLoadSuccess}
                    className="flex flex-col items-center"
                    loading={null}
                >
                    {/* @ts-ignore */}
                    <HTMLFlipBook
                        width={550 * scale}
                        height={733 * scale}
                        size="fixed"
                        minWidth={315}
                        maxWidth={1000}
                        minHeight={400}
                        maxHeight={1533}
                        showCover={true}
                        mobileScrollSupport={true}
                        onFlip={(e) => setPageNumber(e.data + 1)}
                        className="flip-book-shadow shadow-2xl"
                        ref={bookRef}
                    >
                        {Array.from(new Array(numPages), (el, index) => (
                            <PageElement key={`page_${index + 1}`}>
                                {Math.abs(pageNumber - (index + 1)) <= 3 ? (
                                    <Page
                                        pageNumber={index + 1}
                                        width={550 * scale}
                                        renderAnnotationLayer={false}
                                        renderTextLayer={false}
                                        className="select-none pointer-events-none"
                                        loading={
                                            <div className="w-full h-full flex items-center justify-center bg-gray-50">
                                                <Loader2 size={32} className="animate-spin text-gray-200" />
                                            </div>
                                        }
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-zinc-50 border border-zinc-100">
                                        <div className="flex flex-col items-center gap-2 opacity-20">
                                            <Loader2 size={24} className="animate-spin" />
                                            <span className="text-[10px] font-black uppercase tracking-widest">Memuat Halaman {index + 1}</span>
                                        </div>
                                    </div>
                                )}
                            </PageElement>
                        ))}
                    </HTMLFlipBook>
                </Document>
            </div>

            {/* Footer Navigation */}
            <div className="h-24 bg-zinc-900/90 backdrop-blur-2xl border-t border-white/5 px-10 flex items-center justify-between z-10">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => bookRef.current?.pageFlip()?.flipPrev()}
                        className="w-14 h-14 bg-zinc-800 hover:bg-red-600 rounded-2xl flex items-center justify-center text-white transition-all shadow-xl group border border-white/5"
                    >
                        <ChevronLeft size={28} strokeWidth={3} className="group-active:-translate-x-1 transition-transform" />
                    </button>
                    <button
                        onClick={() => bookRef.current?.pageFlip()?.flipNext()}
                        className="w-14 h-14 bg-zinc-800 hover:bg-red-600 rounded-2xl flex items-center justify-center text-white transition-all shadow-xl group border border-white/5"
                    >
                        <ChevronRight size={28} strokeWidth={3} className="group-active:translate-x-1 transition-transform" />
                    </button>
                </div>

                <div className="flex flex-col items-center gap-2">
                    <div className="flex items-center gap-4">
                        <span className="text-3xl font-black text-white tracking-tighter">{pageNumber}</span>
                        <div className="w-px h-6 bg-white/10"></div>
                        <span className="text-sm font-bold text-white/30 uppercase tracking-widest">{numPages || '--'} Halaman</span>
                    </div>
                    {/* Progress Bar */}
                    <div className="w-64 h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-red-600 transition-all duration-300 shadow-[0_0_10px_rgba(220,38,38,0.5)]"
                            style={{ width: `${(pageNumber / (numPages || 1)) * 100}%` }}
                        ></div>
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    <div className="hidden md:flex flex-col text-right">
                        <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">Reading Progress</span>
                        <span className="text-xs font-black text-red-500 uppercase tracking-widest">
                            {Math.round((pageNumber / (numPages || 1)) * 100)}% Complete
                        </span>
                    </div>
                    <button className="p-3 bg-zinc-800/50 hover:bg-white/10 rounded-2xl text-white/40 hover:text-white transition-all">
                        <Settings size={22} strokeWidth={2.5} />
                    </button>
                </div>
            </div>

            {/* Styles for flipbook and PDF pages */}
            <style dangerouslySetInnerHTML={{
                __html: `
                .flip-book-shadow {
                    box-shadow: 0 50px 100px -20px rgba(0,0,0,0.5), 0 30px 60px -30px rgba(0,0,0,0.6);
                }
                .page-content {
                    overflow: hidden;
                    user-select: none;
                }
                .react-pdf__Page__canvas {
                    max-width: 100%;
                    height: auto !important;
                }
            `}} />
        </div>
    );
}
