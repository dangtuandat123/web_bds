export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export enum UserRole {
    USER = 'USER',
    ADMIN = 'ADMIN',
}

export enum ProjectCategory {
    APARTMENT = 'APARTMENT',
    VILLA = 'VILLA',
    LAND = 'LAND',
}

export enum ProjectStatus {
    UPCOMING = 'UPCOMING',
    SELLING = 'SELLING',
    SOLD_OUT = 'SOLD_OUT',
}

export enum ListingType {
    APARTMENT = 'APARTMENT',
    HOUSE = 'HOUSE',
    LAND = 'LAND',
    RENT = 'RENT',
}

export enum LeadSource {
    FORM = 'FORM',
    CHATBOT = 'CHATBOT',
    PHONE = 'PHONE',
}

export enum LeadStatus {
    NEW = 'NEW',
    CONTACTED = 'CONTACTED',
    QUALIFIED = 'QUALIFIED',
    CONVERTED = 'CONVERTED',
    LOST = 'LOST',
}

export interface User {
    id: number
    email: string
    name: string
    role: UserRole
    createdAt: Date
    updatedAt: Date
}

export interface Project {
    id: number
    name: string
    slug: string
    category: ProjectCategory
    location: string
    fullLocation?: string | null
    description: string
    content?: string | null
    priceRange: string
    status: ProjectStatus
    images: Json
    thumbnailUrl: string
    createdAt: Date
    updatedAt: Date
}

export interface Listing {
    id: number
    title: string
    slug: string
    description: string
    content?: string | null
    price: number
    area: number
    bedrooms: number
    bathrooms: number
    direction?: string | null
    location: string
    fullLocation?: string | null
    images: Json
    thumbnailUrl: string
    type: ListingType
    tags?: Json | null
    isFeatured: boolean
    isActive: boolean
    createdAt: Date
    updatedAt: Date
    projectId?: number | null
}

export interface Lead {
    id: number
    name: string
    phone: string
    email?: string | null
    message?: string | null
    source: LeadSource
    status: LeadStatus
    createdAt: Date
    updatedAt: Date
}

export interface ChatSession {
    id: number
    sessionId: string
    messages: Json
    metadata?: Json | null
    createdAt: Date
    updatedAt: Date
}

// AI & Chat Types
export interface SearchVectorDBArgs {
    query: string
    limit?: number
}

export interface CreateLeadArgs {
    name: string
    phone: string
    message?: string
}
