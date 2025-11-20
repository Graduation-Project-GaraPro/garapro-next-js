import { PaidStatus } from "./repair-order";

// Structure for the card data used in real-time updates
export interface RoBoardCardDto {
  repairOrderId: string;
  receiveDate: string;
  statusName: string;
  vehicleInfo: string;
  customerInfo: string;
  serviceName: string;
  estimatedAmount: number;
  branchName: string;
  label: {
    labelId: number;
    labelName: string;
    color: string;
  } | null;
  paidStatus: PaidStatus;
}
