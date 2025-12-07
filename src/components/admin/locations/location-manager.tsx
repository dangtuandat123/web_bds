'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Plus, Pencil, Trash2, Save, X, GripVertical, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
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
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { createLocation, updateLocation, deleteLocation, seedLocations } from '@/app/actions/location'

interface Location {
    id: number
    name: string
    isActive: boolean
    sortOrder: number
}

interface LocationManagerProps {
    initialLocations: Location[]
}

export default function LocationManager({ initialLocations }: LocationManagerProps) {
    const [locations, setLocations] = useState<Location[]>(initialLocations)
    const [isAdding, setIsAdding] = useState(false)
    const [editingId, setEditingId] = useState<number | null>(null)
    const [newName, setNewName] = useState('')
    const [editName, setEditName] = useState('')
    const [editActive, setEditActive] = useState(true)
    const [isLoading, setIsLoading] = useState(false)

    const handleAdd = async () => {
        if (!newName.trim()) {
            toast.error('Vui lòng nhập tên khu vực')
            return
        }

        setIsLoading(true)
        const result = await createLocation({ name: newName.trim() })
        setIsLoading(false)

        if (result.success && result.data) {
            setLocations([...locations, result.data])
            setNewName('')
            setIsAdding(false)
            toast.success(result.message)
        } else {
            toast.error(result.error)
        }
    }

    const handleEdit = async (id: number) => {
        if (!editName.trim()) {
            toast.error('Vui lòng nhập tên khu vực')
            return
        }

        setIsLoading(true)
        const result = await updateLocation(id, { name: editName.trim(), isActive: editActive })
        setIsLoading(false)

        if (result.success) {
            setLocations(locations.map(l =>
                l.id === id ? { ...l, name: editName.trim(), isActive: editActive } : l
            ))
            setEditingId(null)
            toast.success(result.message)
        } else {
            toast.error(result.error)
        }
    }

    const handleDelete = async (id: number) => {
        setIsLoading(true)
        const result = await deleteLocation(id)
        setIsLoading(false)

        if (result.success) {
            setLocations(locations.filter(l => l.id !== id))
            toast.success(result.message)
        } else {
            toast.error(result.error)
        }
    }

    const handleSeed = async () => {
        setIsLoading(true)
        const result = await seedLocations()
        setIsLoading(false)

        if (result.success) {
            toast.success(result.message)
            // Reload page to get new data
            window.location.reload()
        } else {
            toast.error(result.error)
        }
    }

    const startEdit = (location: Location) => {
        setEditingId(location.id)
        setEditName(location.name)
        setEditActive(location.isActive)
    }

    const toggleActive = async (location: Location) => {
        setIsLoading(true)
        const result = await updateLocation(location.id, { name: location.name, isActive: !location.isActive })
        setIsLoading(false)

        if (result.success) {
            setLocations(locations.map(l =>
                l.id === location.id ? { ...l, isActive: !l.isActive } : l
            ))
        } else {
            toast.error(result.error)
        }
    }

    return (
        <div className="space-y-4">
            {/* Action buttons */}
            <div className="flex gap-2">
                {!isAdding && (
                    <Button onClick={() => setIsAdding(true)} className="bg-amber-500 hover:bg-amber-600">
                        <Plus className="h-4 w-4 mr-2" />
                        Thêm khu vực
                    </Button>
                )}
                {locations.length === 0 && (
                    <Button onClick={handleSeed} variant="outline" disabled={isLoading}>
                        <Sparkles className="h-4 w-4 mr-2" />
                        Tạo dữ liệu mẫu (24 quận/huyện)
                    </Button>
                )}
            </div>

            {/* Add form */}
            {isAdding && (
                <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg border">
                    <Input
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        placeholder="Nhập tên khu vực (VD: Quận 1, Thủ Đức, ...)"
                        className="flex-1 max-w-md"
                        onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                        autoFocus
                    />
                    <Button onClick={handleAdd} disabled={isLoading} className="bg-green-500 hover:bg-green-600">
                        <Save className="h-4 w-4 mr-1" />
                        Lưu
                    </Button>
                    <Button onClick={() => { setIsAdding(false); setNewName('') }} variant="outline">
                        <X className="h-4 w-4 mr-1" />
                        Hủy
                    </Button>
                </div>
            )}

            {/* Table */}
            <div className="border rounded-lg bg-white">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-slate-50">
                            <TableHead className="w-12">#</TableHead>
                            <TableHead>Tên khu vực</TableHead>
                            <TableHead className="w-32 text-center">Trạng thái</TableHead>
                            <TableHead className="w-28 text-right">Thao tác</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {locations.map((location, index) => (
                            <TableRow key={location.id}>
                                <TableCell className="text-slate-400">
                                    {index + 1}
                                </TableCell>
                                <TableCell>
                                    {editingId === location.id ? (
                                        <Input
                                            value={editName}
                                            onChange={(e) => setEditName(e.target.value)}
                                            className="max-w-sm"
                                            onKeyDown={(e) => e.key === 'Enter' && handleEdit(location.id)}
                                        />
                                    ) : (
                                        <span className={`font-medium ${!location.isActive ? 'text-slate-400 line-through' : ''}`}>
                                            {location.name}
                                        </span>
                                    )}
                                </TableCell>
                                <TableCell className="text-center">
                                    {editingId === location.id ? (
                                        <div className="flex items-center justify-center gap-2">
                                            <Switch
                                                checked={editActive}
                                                onCheckedChange={setEditActive}
                                            />
                                            <span className="text-sm text-slate-500">
                                                {editActive ? 'Hiện' : 'Ẩn'}
                                            </span>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => toggleActive(location)}
                                            disabled={isLoading}
                                            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${location.isActive
                                                    ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                                    : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                                                }`}
                                        >
                                            {location.isActive ? '✓ Hiện' : '○ Ẩn'}
                                        </button>
                                    )}
                                </TableCell>
                                <TableCell className="text-right">
                                    {editingId === location.id ? (
                                        <div className="flex gap-1 justify-end">
                                            <Button onClick={() => handleEdit(location.id)} disabled={isLoading} size="sm" className="bg-green-500 hover:bg-green-600">
                                                <Save className="h-4 w-4" />
                                            </Button>
                                            <Button onClick={() => setEditingId(null)} size="sm" variant="outline">
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ) : (
                                        <div className="flex gap-1 justify-end">
                                            <Button onClick={() => startEdit(location)} size="sm" variant="ghost">
                                                <Pencil className="h-4 w-4 text-blue-600" />
                                            </Button>
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button size="sm" variant="ghost">
                                                        <Trash2 className="h-4 w-4 text-red-600" />
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>Xóa khu vực?</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            Bạn có chắc muốn xóa khu vực "{location.name}"?
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Hủy</AlertDialogCancel>
                                                        <AlertDialogAction
                                                            onClick={() => handleDelete(location.id)}
                                                            className="bg-red-500 hover:bg-red-600"
                                                        >
                                                            Xóa
                                                        </AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </div>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                        {locations.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center py-12 text-slate-500">
                                    <div className="flex flex-col items-center gap-2">
                                        <span className="text-4xl">📍</span>
                                        <p>Chưa có khu vực nào</p>
                                        <p className="text-sm">Bấm "Thêm khu vực" hoặc "Tạo dữ liệu mẫu" để bắt đầu</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
