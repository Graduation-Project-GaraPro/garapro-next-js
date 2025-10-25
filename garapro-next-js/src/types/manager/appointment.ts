export interface ManagerAppointment {
  id: string;
  time: string;
  customer: string;
  service: string;
  status: "confirmed" | "pending" | "in-progress" | "completed" | "cancelled";
  phone: string;
  email: string;
  vehicle: string;
  notes?: string;
  date: string;
  duration?: number; // in minutes
  technician?: string;
  estimatedCost?: number;
}

export interface AppointmentFilter {
  status?: ManagerAppointment["status"];
  service?: string;
  technician?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
}

export interface CreateManagerAppointmentData {
  customer: string;
  service: string;
  date: string;
  time: string;
  phone: string;
  email: string;
  vehicle: string;
  notes?: string;
  duration?: number;
  technician?: string;
  estimatedCost?: number;
}

export interface UpdateManagerAppointmentData extends Partial<CreateManagerAppointmentData> {
  status?: ManagerAppointment["status"];
}