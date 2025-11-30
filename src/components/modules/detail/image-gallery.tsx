'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import Image from 'next/image'
import { ChevronLeft, ChevronRight, X, Maximize2 } from 'lucide-react'

interface ImageGalleryProps {
    images: string[]
    title: string
}

export default function ImageGallery({ images, title }: ImageGalleryProps) {
    const [selectedIndex, setSelectedIndex] = useState(0)
    const [isLightboxOpen, setIsLightboxOpen] = useState(false)
    const [lightboxIndex, setLightboxIndex] = useState(0)
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    const openLightbox = (index: number) => {
        setLightboxIndex(index)
        setIsLightboxOpen(true)
    }

    const nextImage = () => {
        setLightboxIndex((prev) => (prev + 1) % images.length)
    }

    const prevImage = () => {
        setLightboxIndex((prev) => (prev - 1 + images.length) % images.length)
    }

    // Lock/unlock body scroll when lightbox opens/closes
    useEffect(() => {
        if (isLightboxOpen) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = 'unset'
        }

        // Cleanup on unmount
        return () => {
            document.body.style.overflow = 'unset'
        }
    }, [isLightboxOpen])

    if (!images || images.length === 0) return null

    // Lightbox content
    const lightboxContent = isLightboxOpen ? (
        <div className="fixed inset-0 z-[99999] h-screen w-screen bg-black/95 backdrop-blur-sm flex items-center justify-center animate-fade-in">
            {/* Close Button */}
            <button
                onClick={() => setIsLightboxOpen(false)}
                className="absolute top-4 right-4 z-[100000] p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all backdrop-blur-md border border-white/20"
            >
                <X size={28} />
            </button>

            {/* Navigation */}
            <div className="relative w-full h-full flex items-center justify-center p-4">
                {/* Prev Button */}
                <button
                    onClick={prevImage}
                    className="absolute left-4 md:left-8 z-50 p-3 md:p-4 bg-black/40 hover:bg-black/60 text-white rounded-full transition-all backdrop-blur-sm border border-white/10"
                >
                    <ChevronLeft size={24} className="md:w-8 md:h-8" />
                </button>

                {/* Main Image */}
                <div className="relative w-full h-full flex justify-center items-center">
                    <img
                        src={images[lightboxIndex]}
                        alt={`Gallery ${lightboxIndex + 1}`}
                        className="max-w-full max-h-full object-contain shadow-2xl rounded-sm"
                    />
                </div>

                {/* Next Button */}
                <button
                    onClick={nextImage}
                    className="absolute right-4 md:right-8 z-50 p-3 md:p-4 bg-black/40 hover:bg-black/60 text-white rounded-full transition-all backdrop-blur-sm border border-white/10"
                >
                    <ChevronRight size={24} className="md:w-8 md:h-8" />
                </button>

                {/* Counter */}
                <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-black/60 text-white px-4 py-1.5 rounded-full text-sm font-bold backdrop-blur-md border border-white/10">
                    {lightboxIndex + 1} / {images.length}
                </div>
            </div>
        </div>
    ) : null

    return (
        <>
            {/* Main Gallery */}
            <div className="space-y-4">
                {/* Main Image */}
                <div
                    className="relative h-[400px] lg:h-[500px] rounded-2xl overflow-hidden group cursor-pointer"
                    onClick={() => openLightbox(selectedIndex)}
                >
                    <Image
                        src={images[selectedIndex]}
                        alt={`${title} - Image ${selectedIndex + 1}`}
                        fill
                        className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>

                    {/* Zoom Icon */}
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black/30 backdrop-blur-sm p-4 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                        <Maximize2 size={32} className="text-white" />
                    </div>

                    {/* Image Counter */}
                    <div className="absolute bottom-4 right-4 bg-black/60 text-white px-3 py-1.5 rounded-full text-sm font-bold backdrop-blur-md">
                        {selectedIndex + 1} / {images.length}
                    </div>
                </div>

                {/* Thumbnails Grid */}
                {images.length > 1 && (
                    <div className="grid grid-cols-4 md:grid-cols-6 gap-3">
                        {images.map((img, idx) => (
                            <div
                                key={idx}
                                onClick={() => setSelectedIndex(idx)}
                                className={`relative h-20 md:h-24 rounded-lg overflow-hidden cursor-pointer border-2 transition-all ${selectedIndex === idx
                                        ? 'border-amber-500 opacity-100 scale-105'
                                        : 'border-transparent opacity-70 hover:opacity-100 hover:border-slate-300'
                                    }`}
                            >
                                <Image
                                    src={img}
                                    alt={`Thumbnail ${idx + 1}`}
                                    fill
                                    className="object-cover"
                                />
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Lightbox Portal - Render outside layout hierarchy */}
            {mounted && lightboxContent && createPortal(lightboxContent, document.body)}
        </>
    )
}
