'use client'

import dynamic from 'next/dynamic'
import { useMemo } from 'react'
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
        <div className="rich-text-editor">
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
