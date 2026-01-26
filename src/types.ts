export type UserRole = 'DOCTOR' | 'PATIENT'

export const SPECIALIZATIONS = [
    'Kardiolog',
    'Pediatra',
    'Dermatolog',
    'Neurolog',
    'Ortopeda',
    'Okulista',
    'Ginekolog',
    'Psychiatra',
    'Endykronolog',
    'Gastrolog',
    'Onkolog',
    'Urolog',
    'Internista',
    'Chirurg',
    'Laryngolog'
] as const;

export type Specialization = typeof SPECIALIZATIONS[number];

export interface User {
    id: string,
    name: string,
    role: UserRole,
    specialization?: string,
    avatarUrl?: string;
}

export type AppointmentStatus = 'AVAILABLE' | 'PENDING_PAYMENT' | 'BOOKED' | 'COMPLETED' | 'CANCELLED';
export type AppointmentType = 'CONSULTATION' | 'FOLLOW_UP' | 'PRESCRIPTION';

export interface Appointment {
    id: string,
    doctorId: string,
    patientId?: string,
    startTime: string,
    durationMinutes: number,
    status: AppointmentStatus,
    type: AppointmentType,
    notes?: string,
    patientName?: string;
    isSubSlot?: boolean;
}

export type WeekDay = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

export interface TimeRange {
    start: string; // HH:mm
    end: string;   // HH:mm
}

export interface Notification {
    _id: string;
    recipientId: string;
    message: string;
    type: 'CANCELLATION' | 'SYSTEM';
    isRead: boolean;
    createdAt: string;
}

export interface AvailabilityRule {
    type: 'CYCLIC' | 'ONETIME';
    dateRange?: {
        start: Date;
        end: Date;
    };
    daysOfWeek?: WeekDay[];
    singleDate?: Date;
    timeRanges: TimeRange[];
}

export interface Absence {
    id: string;
    startDate: Date;
    endDate: Date;
    reason?: string;
}

export type Gender = 'MALE' | 'FEMALE' | 'OTHER';

export interface BookingFormData {
    patientName: string;
    patientGender: Gender;
    patientAge: number;
    consultationType: AppointmentType;
    durationMinutes: number;
    notes: string;
    documents: File[];
}

export interface CartItem {
    appointment: Appointment;
    price: number;
}