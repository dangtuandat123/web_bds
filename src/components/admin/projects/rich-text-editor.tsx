'use client'

import dynamic from 'next/dynamic'
import { useMemo, useEffect, useRef } from 'react'
import 'react-quill-new/dist/quill.snow.css'

// Dynamic import to avoid SSR issues
const ReactQuill = dynamic(() => import('react-quill-new'), {
    ssr: false,
    loading: () => (
        <div className="h-[250px] border rounded-lg bg-slate-50 animate-pulse" />
    ),
})

interface RichTextEditorProps {
    value: string
    onChange: (content: string) => void
}

export default function RichTextEditor({ value, onChange }: RichTextEditorProps) {
    const containerRef = useRef<HTMLDivElement>(null)

    // Setup custom image handler after component mounts
    useEffect(() => {
        const setupImageHandler = () => {
            const container = containerRef.current
            if (!container) return

            // Find the image button in toolbar
            const imageButton = container.querySelector('.ql-image')
            if (!imageButton) {
                // Retry if button not found yet
                setTimeout(setupImageHandler, 100)
                return
            }

            // Replace existing click handler
            const newImageButton = imageButton.cloneNode(true) as HTMLElement
            imageButton.parentNode?.replaceChild(newImageButton, imageButton)

            newImageButton.addEventListener('click', (e) => {
                e.preventDefault()
                e.stopPropagation()

                const input = document.createElement('input')
                input.setAttribute('type', 'file')
                input.setAttribute('accept', 'image/*')
                input.click()

                input.onchange = async () => {
                    const file = input.files?.[0]
                    if (!file) return

                    try {
                        // Upload image to server
                        const formData = new FormData()
                        formData.append('file', file)

                        const response = await fetch('/api/upload', {
                            method: 'POST',
                            body: formData,
                        })

                        const data = await response.json()

                        if (response.ok && data.url) {
                            // Get Quill editor instance from DOM
                            const editorContainer = container.querySelector('.ql-editor')
                            if (editorContainer) {
                                // Insert image at the end or at cursor
                                const img = document.createElement('img')
                                img.src = data.url
                                img.style.maxWidth = '100%'
                                editorContainer.appendChild(img)

                                // Trigger onChange to update form value
                                const event = new Event('input', { bubbles: true })
                                editorContainer.dispatchEvent(event)

                                // Update the value through onChange
                                const htmlContent = editorContainer.innerHTML
                                onChange(htmlContent)
                            }
                        } else {
                            alert('Lỗi upload ảnh: ' + (data.error || 'Không xác định'))
                        }
                    } catch (error) {
                        console.error('Image upload error:', error)
                        alert('Lỗi upload ảnh. Vui lòng thử lại.')
                    }
                }
            })
        }

        // Delay to ensure Quill is mounted
        const timer = setTimeout(setupImageHandler, 500)
        return () => clearTimeout(timer)
    }, [onChange])

    // Full-featured Quill modules configuration
    const modules = useMemo(() => ({
        toolbar: [
            // Headers
            [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
            [{ 'font': [] }],
            [{ 'size': ['small', false, 'large', 'huge'] }],

            // Text formatting
            ['bold', 'italic', 'underline', 'strike'],
            [{ 'color': [] }, { 'background': [] }],

            // Scripts
            [{ 'script': 'sub' }, { 'script': 'super' }],

            // Lists & indentation
            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
            [{ 'indent': '-1' }, { 'indent': '+1' }],

            // Alignment
            [{ 'align': [] }],
            [{ 'direction': 'rtl' }],

            // Media & links
            ['link', 'image', 'video'],

            // Blockquote & code
            ['blockquote', 'code-block'],

            // Clear
            ['clean'],
        ],
    }), [])

    const formats = [
        'header', 'font', 'size',
        'bold', 'italic', 'underline', 'strike',
        'color', 'background',
        'script',
        'list', 'indent',
        'align', 'direction',
        'link', 'image', 'video',
        'blockquote', 'code-block',
    ]

    return (
        <div className="rich-text-editor" ref={containerRef}>
            <ReactQuill
                theme="snow"
                value={value}
                onChange={onChange}
                modules={modules}
                formats={formats}
                placeholder="Nhập nội dung chi tiết..."
                className="bg-white rounded-lg"
            />
            <style jsx global>{`
                .rich-text-editor .ql-container {
                    min-height: 250px;
                    font-size: 14px;
                    border-bottom-left-radius: 0.5rem;
                    border-bottom-right-radius: 0.5rem;
                }
                .rich-text-editor .ql-toolbar {
                    border-top-left-radius: 0.5rem;
                    border-top-right-radius: 0.5rem;
                    background: #f8fafc;
                    flex-wrap: wrap;
                }
                .rich-text-editor .ql-editor {
                    min-height: 220px;
                }
                .rich-text-editor .ql-editor img {
                    max-width: 100%;
                    height: auto;
                    border-radius: 8px;
                    margin: 8px 0;
                }
                .rich-text-editor .ql-snow .ql-picker {
                    color: #374151;
                }
                .rich-text-editor .ql-snow .ql-stroke {
                    stroke: #374151;
                }
                .rich-text-editor .ql-snow .ql-fill {
                    fill: #374151;
                }
                .rich-text-editor .ql-toolbar.ql-snow .ql-picker.ql-expanded .ql-picker-options {
                    z-index: 100;
                }
            `}</style>
        </div>
    )
}
