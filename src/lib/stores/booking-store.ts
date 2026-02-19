import { create } from 'zustand'

interface BookingFormData {
  workerId: string | null
  serviceId: string | null
  scheduledDate: string | null
  startTime: string | null
  endTime: string | null
  address: string
  locationLat: number | null
  locationLng: number | null
  instructions: string
  isRecurring: boolean
  recurrenceDays: number[]
  recurrenceEndDate: string | null
}

interface BookingState {
  formData: BookingFormData
  currentStep: number
  setFormField: <K extends keyof BookingFormData>(key: K, value: BookingFormData[K]) => void
  setStep: (step: number) => void
  nextStep: () => void
  prevStep: () => void
  reset: () => void
}

const defaultFormData: BookingFormData = {
  workerId: null,
  serviceId: null,
  scheduledDate: null,
  startTime: null,
  endTime: null,
  address: '',
  locationLat: null,
  locationLng: null,
  instructions: '',
  isRecurring: false,
  recurrenceDays: [],
  recurrenceEndDate: null,
}

export const useBookingStore = create<BookingState>((set) => ({
  formData: defaultFormData,
  currentStep: 0,
  setFormField: (key, value) =>
    set((state) => ({ formData: { ...state.formData, [key]: value } })),
  setStep: (step) => set({ currentStep: step }),
  nextStep: () => set((state) => ({ currentStep: state.currentStep + 1 })),
  prevStep: () => set((state) => ({ currentStep: Math.max(0, state.currentStep - 1) })),
  reset: () => set({ formData: defaultFormData, currentStep: 0 }),
}))
