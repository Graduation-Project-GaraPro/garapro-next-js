import { 
  ManagerAppointment, 
  CreateManagerAppointmentData, 
  UpdateManagerAppointmentData, 
  AppointmentFilter 
} from "@/types/manager/appointment";

// Mock data for manager appointments view
const mockManagerAppointments: ManagerAppointment[] = [
  {
    id: "1",
    time: "09:00",
    customer: "John Smith",
    service: "Oil Change",
    status: "confirmed",
    phone: "(555) 123-4567",
    email: "john.smith@email.com",
    vehicle: "2020 Honda Civic",
    notes: "Customer requested synthetic oil. Last service 6 months ago.",
    date: "2025-01-20",
    duration: 45,
    technician: "Mike Johnson",
    estimatedCost: 89.99,
  },
  {
    id: "2",
    time: "10:30",
    customer: "Sarah Johnson",
    service: "Brake Inspection",
    status: "pending",
    phone: "(555) 234-5678",
    email: "sarah.j@email.com",
    vehicle: "2018 Toyota Camry",
    notes: "Customer reports squeaking noise when braking.",
    date: "2025-01-20",
    duration: 60,
    estimatedCost: 125.00,
  },
  {
    id: "3",
    time: "14:00",
    customer: "Mike Wilson",
    service: "Engine Diagnostic",
    status: "confirmed",
    phone: "(555) 345-6789",
    email: "mike.wilson@email.com",
    vehicle: "2019 Ford F-150",
    notes: "Check engine light on. Possible transmission issue.",
    date: "2025-01-20",
    duration: 90,
    technician: "David Brown",
    estimatedCost: 175.00,
  },
  {
    id: "4",
    time: "08:00",
    customer: "Lisa Brown",
    service: "Tire Rotation",
    status: "confirmed",
    phone: "(555) 456-7890",
    email: "lisa.brown@email.com",
    vehicle: "2021 Subaru Outback",
    notes: "Regular maintenance. Customer is a VIP.",
    date: "2025-01-21",
    duration: 30,
    technician: "Mike Johnson",
    estimatedCost: 45.00,
  },
  {
    id: "5",
    time: "11:00",
    customer: "David Lee",
    service: "Transmission Service",
    status: "in-progress",
    phone: "(555) 567-8901",
    email: "david.lee@email.com",
    vehicle: "2017 BMW 3 Series",
    notes: "Transmission fluid change and filter replacement.",
    date: "2025-01-21",
    duration: 120,
    technician: "Tom Wilson",
    estimatedCost: 250.00,
  },
  {
    id: "6",
    time: "09:30",
    customer: "Emma Davis",
    service: "AC Repair",
    status: "confirmed",
    phone: "(555) 678-9012",
    email: "emma.davis@email.com",
    vehicle: "2019 Mercedes C-Class",
    notes: "AC not cooling properly. May need refrigerant.",
    date: "2025-01-22",
    duration: 75,
    technician: "David Brown",
    estimatedCost: 195.00,
  },
  {
    id: "7",
    time: "13:00",
    customer: "Tom Anderson",
    service: "Battery Replacement",
    status: "pending",
    phone: "(555) 789-0123",
    email: "tom.anderson@email.com",
    vehicle: "2016 Jeep Wrangler",
    notes: "Battery died twice this week. Needs replacement.",
    date: "2025-01-22",
    duration: 45,
    estimatedCost: 145.00,
  },
  {
    id: "8",
    time: "15:30",
    customer: "Amy White",
    service: "Wheel Alignment",
    status: "confirmed",
    phone: "(555) 890-1234",
    email: "amy.white@email.com",
    vehicle: "2020 Nissan Altima",
    notes: "Car pulling to the right. Recent tire replacement.",
    date: "2025-01-22",
    duration: 60,
    technician: "Mike Johnson",
    estimatedCost: 110.00,
  },
];

// Helper function to simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const managerAppointmentService = {
  // Get all appointments with optional filtering
  getAppointments: async (filter?: AppointmentFilter): Promise<ManagerAppointment[]> => {
    await delay(500);
    let filteredAppointments = [...mockManagerAppointments];

    if (filter) {
      if (filter.status) {
        filteredAppointments = filteredAppointments.filter(
          apt => apt.status === filter.status
        );
      }
      if (filter.service) {
        filteredAppointments = filteredAppointments.filter(
          apt => apt.service.toLowerCase().includes(filter.service!.toLowerCase())
        );
      }
      if (filter.technician) {
        filteredAppointments = filteredAppointments.filter(
          apt => apt.technician?.toLowerCase().includes(filter.technician!.toLowerCase())
        );
      }
      if (filter.dateRange) {
        filteredAppointments = filteredAppointments.filter(apt => {
          const aptDate = new Date(apt.date);
          return aptDate >= filter.dateRange!.start && aptDate <= filter.dateRange!.end;
        });
      }
    }

    return filteredAppointments;
  },

  // Get appointments for a specific date
  getAppointmentsByDate: async (date: string): Promise<ManagerAppointment[]> => {
    await delay(300);
    return mockManagerAppointments.filter(apt => apt.date === date);
  },

  // Get a specific appointment by ID
  getAppointmentById: async (id: string): Promise<ManagerAppointment | null> => {
    await delay(300);
    const appointment = mockManagerAppointments.find(apt => apt.id === id);
    return appointment ? { ...appointment } : null;
  },

  // Create a new appointment
  createAppointment: async (data: CreateManagerAppointmentData): Promise<ManagerAppointment> => {
    await delay(800);
    const newId = (Math.max(...mockManagerAppointments.map(apt => parseInt(apt.id))) + 1).toString();
    const newAppointment: ManagerAppointment = {
      id: newId,
      ...data,
      status: "pending",
    };
    mockManagerAppointments.push(newAppointment);
    return { ...newAppointment };
  },

  // Update an existing appointment
  updateAppointment: async (id: string, data: UpdateManagerAppointmentData): Promise<ManagerAppointment> => {
    await delay(600);
    const index = mockManagerAppointments.findIndex(apt => apt.id === id);
    if (index === -1) {
      throw new Error(`Appointment with ID ${id} not found`);
    }
    mockManagerAppointments[index] = { ...mockManagerAppointments[index], ...data };
    return { ...mockManagerAppointments[index] };
  },

  // Delete/Cancel an appointment
  deleteAppointment: async (id: string): Promise<void> => {
    await delay(500);
    const index = mockManagerAppointments.findIndex(apt => apt.id === id);
    if (index === -1) {
      throw new Error(`Appointment with ID ${id} not found`);
    }
    mockManagerAppointments.splice(index, 1);
  },

  // Update appointment status
  updateAppointmentStatus: async (id: string, status: ManagerAppointment["status"]): Promise<ManagerAppointment> => {
    await delay(400);
    const index = mockManagerAppointments.findIndex(apt => apt.id === id);
    if (index === -1) {
      throw new Error(`Appointment with ID ${id} not found`);
    }
    mockManagerAppointments[index].status = status;
    return { ...mockManagerAppointments[index] };
  },

  // Get appointment statistics
  getAppointmentStats: async (): Promise<{
    total: number;
    confirmed: number;
    pending: number;
    inProgress: number;
    completed: number;
    cancelled: number;
  }> => {
    await delay(400);
    const stats = mockManagerAppointments.reduce(
      (acc, apt) => {
        acc.total++;
        acc[apt.status === "in-progress" ? "inProgress" : apt.status]++;
        return acc;
      },
      { total: 0, confirmed: 0, pending: 0, inProgress: 0, completed: 0, cancelled: 0 }
    );
    return stats;
  },
};