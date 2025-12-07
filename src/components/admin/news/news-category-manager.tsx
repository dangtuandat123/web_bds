'use client'

import { useState, useTransition } from 'react'
import { Plus, Edit2, Trash2, Check, X, FolderPlus, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
    createNewsCategory,
    updateNewsCategory,
    deleteNewsCategory,
    seedNewsCategories,
} from '@/app/actions/news-category'

interface NewsCategory {
    id: number
    name: string
    slug: string
    isActive: boolean
    sortOrder: number
    _count: { news: number }
}

interface NewsCategoryManagerProps {
    categories: NewsCategory[]
}

export default function NewsCategoryManager({ categories }: NewsCategoryManagerProps) {
    const [isPending, startTransition] = useTransition()
    const [editingId, setEditingId] = useState<number | null>(null)
    const [editName, setEditName] = useState('')
    const [newName, setNewName] = useState('')
    const [isAdding, setIsAdding] = useState(false)
    const [deleteId, setDeleteId] = useState<number | null>(null)

    const handleAdd = () => {
        if (!newName.trim()) {
            toast.error('Vui lòng nhập tên danh mục')
            return
        }

        startTransition(async () => {
            const result = await createNewsCategory({ name: newName.trim() })
            if (result.success) {
                toast.success(result.message)
                setNewName('')
                setIsAdding(false)
            } else {
                toast.error(result.error)
            }
        })
    }

    const handleEdit = (category: NewsCategory) => {
        setEditingId(category.id)
        setEditName(category.name)
    }

    const handleSaveEdit = () => {
        if (!editName.trim() || editingId === null) return

        startTransition(async () => {
            const result = await updateNewsCategory(editingId, { name: editName.trim() })
            if (result.success) {
                toast.success(result.message)
                setEditingId(null)
                setEditName('')
            } else {
                toast.error(result.error)
            }
        })
    }

    const handleCancelEdit = () => {
        setEditingId(null)
        setEditName('')
    }

    const handleDelete = (id: number) => {
        startTransition(async () => {
            const result = await deleteNewsCategory(id)
            if (result.success) {
                toast.success(result.message)
            } else {
                toast.error(result.error)
            }
            setDeleteId(null)
        })
    }

    const handleToggleActive = (category: NewsCategory) => {
        startTransition(async () => {
            const result = await updateNewsCategory(category.id, {
                name: category.name,
                isActive: !category.isActive,
            })
            if (result.success) {
                toast.success(category.isActive ? 'Đã ẩn danh mục' : 'Đã hiển thị danh mục')
            } else {
                toast.error(result.error)
            }
        })
    }

    const handleSeed = () => {
        startTransition(async () => {
            const result = await seedNewsCategories()
            if (result.success) {
                toast.success(result.message)
            } else {
                toast.error(result.error)
            }
        })
    }

    return (
        <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-xl font-bold text-slate-800">Danh mục tin tức</h2>
                    <p className="text-sm text-slate-500 mt-1">
                        Quản lý các danh mục cho bài viết
                    </p>
                </div>
                <div className="flex gap-2">
                    {categories.length === 0 && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleSeed}
                            disabled={isPending}
                        >
                            <FolderPlus className="h-4 w-4 mr-2" />
                            Tạo danh mục mẫu
                        </Button>
                    )}
                    <Button size="sm" onClick={() => setIsAdding(true)} disabled={isAdding || isPending}>
                        <Plus className="h-4 w-4 mr-2" />
                        Thêm danh mục
                    </Button>
                </div>
            </div>

            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[50px]">#</TableHead>
                        <TableHead>Tên danh mục</TableHead>
                        <TableHead>Slug</TableHead>
                        <TableHead className="text-center">Số bài</TableHead>
                        <TableHead className="text-center">Trạng thái</TableHead>
                        <TableHead className="text-right">Thao tác</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {/* Add new row */}
                    {isAdding && (
                        <TableRow className="bg-amber-50">
                            <TableCell>
                                <Badge variant="outline">Mới</Badge>
                            </TableCell>
                            <TableCell>
                                <Input
                                    value={newName}
                                    onChange={(e) => setNewName(e.target.value)}
                                    placeholder="Nhập tên danh mục..."
                                    className="h-8"
                                    autoFocus
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') handleAdd()
                                        if (e.key === 'Escape') {
                                            setIsAdding(false)
                                            setNewName('')
                                        }
                                    }}
                                />
                            </TableCell>
                            <TableCell className="text-slate-400">
                                (tự động tạo)
                            </TableCell>
                            <TableCell className="text-center">-</TableCell>
                            <TableCell className="text-center">-</TableCell>
                            <TableCell className="text-right">
                                <div className="flex justify-end gap-1">
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        className="h-7 w-7 text-green-600 hover:text-green-700 hover:bg-green-50"
                                        onClick={handleAdd}
                                        disabled={isPending}
                                    >
                                        {isPending ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            <Check className="h-4 w-4" />
                                        )}
                                    </Button>
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        className="h-7 w-7 text-slate-400 hover:text-slate-600"
                                        onClick={() => {
                                            setIsAdding(false)
                                            setNewName('')
                                        }}
                                        disabled={isPending}
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            </TableCell>
                        </TableRow>
                    )}

                    {/* Existing categories */}
                    {categories.map((category, index) => (
                        <TableRow key={category.id}>
                            <TableCell className="font-medium text-slate-500">
                                {index + 1}
                            </TableCell>
                            <TableCell>
                                {editingId === category.id ? (
                                    <Input
                                        value={editName}
                                        onChange={(e) => setEditName(e.target.value)}
                                        className="h-8"
                                        autoFocus
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') handleSaveEdit()
                                            if (e.key === 'Escape') handleCancelEdit()
                                        }}
                                    />
                                ) : (
                                    <span className="font-medium text-slate-800">
                                        {category.name}
                                    </span>
                                )}
                            </TableCell>
                            <TableCell className="text-slate-500 font-mono text-sm">
                                {category.slug}
                            </TableCell>
                            <TableCell className="text-center">
                                <Badge variant="secondary">
                                    {category._count.news}
                                </Badge>
                            </TableCell>
                            <TableCell className="text-center">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleToggleActive(category)}
                                    disabled={isPending}
                                    className="h-6 px-2"
                                >
                                    {category.isActive ? (
                                        <Badge className="bg-green-100 text-green-700 hover:bg-green-200">
                                            Hiển thị
                                        </Badge>
                                    ) : (
                                        <Badge variant="secondary" className="text-slate-500">
                                            Ẩn
                                        </Badge>
                                    )}
                                </Button>
                            </TableCell>
                            <TableCell className="text-right">
                                {editingId === category.id ? (
                                    <div className="flex justify-end gap-1">
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            className="h-7 w-7 text-green-600 hover:text-green-700 hover:bg-green-50"
                                            onClick={handleSaveEdit}
                                            disabled={isPending}
                                        >
                                            <Check className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            className="h-7 w-7 text-slate-400 hover:text-slate-600"
                                            onClick={handleCancelEdit}
                                            disabled={isPending}
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="flex justify-end gap-1">
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            className="h-7 w-7 text-slate-400 hover:text-amber-600"
                                            onClick={() => handleEdit(category)}
                                            disabled={isPending}
                                        >
                                            <Edit2 className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            className="h-7 w-7 text-slate-400 hover:text-red-600"
                                            onClick={() => setDeleteId(category.id)}
                                            disabled={isPending || category._count.news > 0}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                )}
                            </TableCell>
                        </TableRow>
                    ))}

                    {categories.length === 0 && !isAdding && (
                        <TableRow>
                            <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                                Chưa có danh mục nào. Nhấn "Tạo danh mục mẫu" hoặc "Thêm danh mục" để bắt đầu.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Xác nhận xóa danh mục?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Hành động này không thể hoàn tác. Danh mục sẽ bị xóa vĩnh viễn.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Hủy</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => deleteId && handleDelete(deleteId)}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            Xóa
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
