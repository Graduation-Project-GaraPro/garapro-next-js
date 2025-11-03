export interface VehicleDto {
  vehicleID: string;
  brandID: string;
  userID: string;
  modelID: string;
  colorID: string;
  licensePlate: string;
  vin: string;
  year: number;
  odometer: number | null;
  lastServiceDate: string;
  nextServiceDate: string | null;
  warrantyStatus: string;
  createdAt: string;
  updatedAt: string | null;
  brandName: string;
  modelName: string;
  colorName: string;
}

export interface RoBoardCustomerDto {
  userId: string;
  firstName: string;
  lastName: string;
  birthday: string | null;
  fullName: string;
  email: string;
  phoneNumber: string;
}

export interface VehicleWithCustomerDto {
  vehicle: VehicleDto;
  customer: RoBoardCustomerDto;
}

export interface CreateVehicleDto {
  brandID: string;
  userID: string;
  modelID: string;
  colorID: string;
  licensePlate: string;
  vin: string;
  year: number;
  odometer: number | null;
}