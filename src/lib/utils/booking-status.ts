export type BookingStatus =
  | 'pending'
  | 'accepted'
  | 'confirmed'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'declined'

export const statusBadgeStyles: Record<BookingStatus, string> = {
  pending: 'bg-[#ffdcc3] text-[#904d00]',
  accepted: 'bg-[#9ffdd3] text-[#005d42]',
  confirmed: 'bg-[#9ffdd3] text-[#005d42]',
  in_progress: 'bg-[#9ffdd3] text-[#005d42]',
  completed: 'bg-[#e8e8e6] text-[#3e4943]',
  cancelled: 'bg-[#ffdad6] text-[#ba1a1a]',
  declined: 'bg-[#ffdad6] text-[#ba1a1a]',
}

export const statusLabels: Record<BookingStatus, string> = {
  pending: 'Pending',
  accepted: 'Accepted',
  confirmed: 'Confirmed',
  in_progress: 'In Progress',
  completed: 'Completed',
  cancelled: 'Cancelled',
  declined: 'Declined',
}

export const statusIcons: Record<BookingStatus, string> = {
  pending: 'schedule',
  accepted: 'check_circle',
  confirmed: 'check_circle',
  in_progress: 'play_circle',
  completed: 'task_alt',
  cancelled: 'cancel',
  declined: 'cancel',
}
