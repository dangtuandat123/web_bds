'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Plus, Pencil, Trash2, Save, X, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
import { createAmenity, updateAmenity, deleteAmenity } from '@/app/actions/amenity'

interface Amenity {
    id: number
    name: string
    icon: string
    _count?: {
        projectamenity: number
        listingamenity: number
    }
}

interface AmenityManagerProps {
    initialAmenities: Amenity[]
}

// Icons grouped by category
const ICON_CATEGORIES = {
    'Tiện ích': ['🏊', '🏋️', '🧘', '🎾', '⚽', '🏀', '🎮', '🎬'],
    'Tòa nhà': ['🛗', '🅿️', '🚗', '🏍️', '🚲', '🚌', '🚇', '🏢'],
    'An ninh': ['🔒', '👮', '📹', '🚨', '🔐', '🛡️', '🔑', '🚪'],
    'Thiên nhiên': ['🌳', '🌴', '🌿', '🌺', '🏡', '🏞️', '⛲', '🌅'],
    'Dịch vụ': ['☕', '🍽️', '🛒', '🏪', '🏥', '💊', '🎓', '📚'],
    'Tiện nghi': ['💡', '❄️', '🔥', '🚿', '🛁', '📡', '📶', '💻'],
    'Trẻ em & Thú cưng': ['👶', '🧒', '🎠', '🎡', '🐕', '🐈', '🐾', '🧸'],
    'View': ['🌊', '🏖️', '⛰️', '🗻', '🌉', '🏙️', '🌆', '🌇'],
    'Khác': ['⭐', '🌟', '💎', '🏆', '🎁', '❤️', '✨', '🏠'],
}

// Icon Picker Component
function IconPicker({
    value,
    onChange,
    isOpen,
    onToggle
}: {
    value: string
    onChange: (icon: string) => void
    isOpen: boolean
    onToggle: () => void
}) {
    return (
        <div className="relative">
            <button
                type="button"
                onClick={onToggle}
                className="flex items-center gap-1 px-3 py-2 border rounded-lg hover:bg-slate-50 transition-colors"
            >
                <span className="text-2xl">{value}</span>
                <ChevronDown className="h-4 w-4 text-slate-500" />
            </button>

            {isOpen && (
                <div className="absolute top-full left-0 mt-1 z-50 bg-white border rounded-lg shadow-lg p-3 w-72 max-h-80 overflow-y-auto">
                    {Object.entries(ICON_CATEGORIES).map(([category, icons]) => (
                        <div key={category} className="mb-3">
                            <p className="text-xs font-medium text-slate-500 mb-1">{category}</p>
                            <div className="flex flex-wrap gap-1">
                                {icons.map(icon => (
                                    <button
                                        key={icon}
                                        type="button"
                                        onClick={() => {
                                            onChange(icon)
                                            onToggle()
                                        }}
                                        className={`text-xl p-1.5 rounded hover:bg-slate-100 transition-colors ${value === icon ? 'bg-amber-100 ring-2 ring-amber-400' : ''
                                            }`}
                                    >
                                        {icon}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

export default function AmenityManager({ initialAmenities }: AmenityManagerProps) {
    const [amenities, setAmenities] = useState<Amenity[]>(initialAmenities)
    const [isAdding, setIsAdding] = useState(false)
    const [editingId, setEditingId] = useState<number | null>(null)
    const [newName, setNewName] = useState('')
    const [newIcon, setNewIcon] = useState('🏠')
    const [editName, setEditName] = useState('')
    const [editIcon, setEditIcon] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [showNewIconPicker, setShowNewIconPicker] = useState(false)
    const [showEditIconPicker, setShowEditIconPicker] = useState(false)

    const handleAdd = async () => {
        if (!newName.trim()) {
            toast.error('Vui lòng nhập tên tiện ích')
            return
        }

        setIsLoading(true)
        const result = await createAmenity({ name: newName.trim(), icon: newIcon })
        setIsLoading(false)

        if (result.success && result.data) {
            setAmenities([...amenities, { ...result.data, _count: { projectamenity: 0, listingamenity: 0 } }])
            setNewName('')
            setNewIcon('🏠')
            setIsAdding(false)
            toast.success(result.message)
        } else {
            toast.error(result.error)
        }
    }

    const handleEdit = async (id: number) => {
        if (!editName.trim()) {
            toast.error('Vui lòng nhập tên tiện ích')
            return
        }

        setIsLoading(true)
        const result = await updateAmenity(id, { name: editName.trim(), icon: editIcon })
        setIsLoading(false)

        if (result.success) {
            setAmenities(amenities.map(a =>
                a.id === id ? { ...a, name: editName.trim(), icon: editIcon } : a
            ))
            setEditingId(null)
            setShowEditIconPicker(false)
            toast.success(result.message)
        } else {
            toast.error(result.error)
        }
    }

    const handleDelete = async (id: number) => {
        setIsLoading(true)
        const result = await deleteAmenity(id)
        setIsLoading(false)

        if (result.success) {
            setAmenities(amenities.filter(a => a.id !== id))
            toast.success(result.message)
        } else {
            toast.error(result.error)
        }
    }

    const startEdit = (amenity: Amenity) => {
        setEditingId(amenity.id)
        setEditName(amenity.name)
        setEditIcon(amenity.icon)
        setShowEditIconPicker(false)
    }

    const cancelAdd = () => {
        setIsAdding(false)
        setNewName('')
        setShowNewIconPicker(false)
    }

    return (
        <div className="space-y-4">
            {/* Add button */}
            {!isAdding && (
                <Button onClick={() => setIsAdding(true)} className="bg-amber-500 hover:bg-amber-600">
                    <Plus className="h-4 w-4 mr-2" />
                    Thêm tiện ích
                </Button>
            )}

            {/* Add form - Clean layout */}
            {isAdding && (
                <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg border">
                    <IconPicker
                        value={newIcon}
                        onChange={setNewIcon}
                        isOpen={showNewIconPicker}
                        onToggle={() => setShowNewIconPicker(!showNewIconPicker)}
                    />
                    <Input
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        placeholder="Nhập tên tiện ích..."
                        className="flex-1 max-w-sm"
                        onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                        autoFocus
                    />
                    <Button onClick={handleAdd} disabled={isLoading} className="bg-green-500 hover:bg-green-600">
                        <Save className="h-4 w-4 mr-1" />
                        Lưu
                    </Button>
                    <Button onClick={cancelAdd} variant="outline">
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
                            <TableHead className="w-24">Icon</TableHead>
                            <TableHead>Tên tiện ích</TableHead>
                            <TableHead className="w-28 text-center">Dự án</TableHead>
                            <TableHead className="w-28 text-center">Sàn GD</TableHead>
                            <TableHead className="w-28 text-right">Thao tác</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {amenities.map(amenity => (
                            <TableRow key={amenity.id}>
                                <TableCell>
                                    {editingId === amenity.id ? (
                                        <IconPicker
                                            value={editIcon}
                                            onChange={setEditIcon}
                                            isOpen={showEditIconPicker}
                                            onToggle={() => setShowEditIconPicker(!showEditIconPicker)}
                                        />
                                    ) : (
                                        <span className="text-2xl">{amenity.icon}</span>
                                    )}
                                </TableCell>
                                <TableCell>
                                    {editingId === amenity.id ? (
                                        <Input
                                            value={editName}
                                            onChange={(e) => setEditName(e.target.value)}
                                            className="max-w-sm"
                                            onKeyDown={(e) => e.key === 'Enter' && handleEdit(amenity.id)}
                                        />
                                    ) : (
                                        <span className="font-medium">{amenity.name}</span>
                                    )}
                                </TableCell>
                                <TableCell className="text-center">
                                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-50 text-blue-600 text-sm font-medium">
                                        {amenity._count?.projectamenity || 0}
                                    </span>
                                </TableCell>
                                <TableCell className="text-center">
                                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-green-50 text-green-600 text-sm font-medium">
                                        {amenity._count?.listingamenity || 0}
                                    </span>
                                </TableCell>
                                <TableCell className="text-right">
                                    {editingId === amenity.id ? (
                                        <div className="flex gap-1 justify-end">
                                            <Button onClick={() => handleEdit(amenity.id)} disabled={isLoading} size="sm" className="bg-green-500 hover:bg-green-600">
                                                <Save className="h-4 w-4" />
                                            </Button>
                                            <Button onClick={() => { setEditingId(null); setShowEditIconPicker(false) }} size="sm" variant="outline">
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ) : (
                                        <div className="flex gap-1 justify-end">
                                            <Button onClick={() => startEdit(amenity)} size="sm" variant="ghost">
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
                                                        <AlertDialogTitle>Xóa tiện ích?</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            Bạn có chắc muốn xóa tiện ích "{amenity.icon} {amenity.name}"?
                                                            {(amenity._count?.projectamenity || 0) + (amenity._count?.listingamenity || 0) > 0 && (
                                                                <span className="block mt-2 text-red-500 font-medium">
                                                                    ⚠️ Tiện ích này đang được sử dụng!
                                                                </span>
                                                            )}
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Hủy</AlertDialogCancel>
                                                        <AlertDialogAction
                                                            onClick={() => handleDelete(amenity.id)}
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
                        {amenities.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-12 text-slate-500">
                                    <div className="flex flex-col items-center gap-2">
                                        <span className="text-4xl">🏷️</span>
                                        <p>Chưa có tiện ích nào</p>
                                        <p className="text-sm">Bấm "Thêm tiện ích" để tạo mới</p>
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
