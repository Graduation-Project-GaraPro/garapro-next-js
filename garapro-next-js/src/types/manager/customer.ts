export interface Customer {
  userId: string;
  firstName: string;
  lastName: string;
  birthday: string | null;
  fullName: string;
  email: string;
  phoneNumber: string;
}

export interface CreateCustomerDto {
  firstName: string;
  lastName: string;
  birthday: string | null;
  phoneNumber: string;
  email: string;
}
