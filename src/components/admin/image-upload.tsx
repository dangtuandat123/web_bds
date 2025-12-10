'use client'

import { useState, useRef, useCallback } from 'react'
import { Upload, X, Loader2, ImageIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ImageUploadProps {
    value: string
    onChange: (url: string) => void
    onRemove?: () => void
    disabled?: boolean
    className?: string
}

export default function ImageUpload({
    value,
    onChange,
    onRemove,
    disabled = false,
    className = '',
}: ImageUploadProps) {
    const [isUploading, setIsUploading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [isDragging, setIsDragging] = useState(false)
    const inputRef = useRef<HTMLInputElement>(null)

    const uploadFile = async (file: File) => {
        setIsUploading(true)
        setError(null)

        try {
            const formData = new FormData()
            formData.append('file', file)

            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Upload thất bại')
            }

            onChange(data.url)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Lỗi upload')
        } finally {
            setIsUploading(false)
        }
    }

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            uploadFile(file)
        }
    }

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(true)
    }, [])

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)
    }, [])

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)

        const file = e.dataTransfer.files?.[0]
        if (file && file.type.startsWith('image/')) {
            uploadFile(file)
        } else {
            setError('Vui lòng chọn file ảnh')
        }
    }, [])

    const handleRemove = () => {
        onChange('')
        onRemove?.()
        if (inputRef.current) {
            inputRef.current.value = ''
        }
    }

    // If has image, show preview
    if (value) {
        return (
            <div className={`relative inline-block ${className}`}>
                <div className="relative w-40 h-28 rounded-lg overflow-hidden border border-slate-200 bg-slate-50">
                    <img src={value}
                        alt="Uploaded image"
                        
                        className="absolute inset-0 w-full h-full object-cover"
                        sizes="160px"
                    />
                    {!disabled && (
                        <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute top-1 right-1 h-6 w-6"
                            onClick={handleRemove}
                        >
                            <X className="h-3 w-3" />
                        </Button>
                    )}
                </div>
            </div>
        )
    }

    // Upload area
    return (
        <div className={`w-full ${className}`}>
            <div
                className={`
                    relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
                    transition-colors duration-200
                    ${isDragging
                        ? 'border-amber-500 bg-amber-50'
                        : 'border-slate-300 hover:border-amber-400 hover:bg-slate-50'
                    }
                    ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
                `}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => !disabled && inputRef.current?.click()}
            >
                <input
                    ref={inputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    onChange={handleFileSelect}
                    disabled={disabled || isUploading}
                    className="hidden"
                />

                {isUploading ? (
                    <div className="flex flex-col items-center gap-2">
                        <Loader2 className="h-10 w-10 text-amber-500 animate-spin" />
                        <p className="text-sm text-slate-600">Đang upload...</p>
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-2">
                        <div className="p-3 rounded-full bg-amber-100">
                            {isDragging ? (
                                <ImageIcon className="h-8 w-8 text-amber-600" />
                            ) : (
                                <Upload className="h-8 w-8 text-amber-600" />
                            )}
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-700">
                                Kéo thả ảnh vào đây
                            </p>
                            <p className="text-xs text-slate-500 mt-1">
                                hoặc click để chọn file (JPG, PNG, WebP, GIF - tối đa 5MB)
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {error && (
                <p className="text-sm text-red-500 mt-2">{error}</p>
            )}
        </div>
    )
}
