export enum WithdrawStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
}

export interface Withdraw {
  id: string;
  amount: number;
  status: WithdrawStatus;
  business_id: string;
  payment_method: string;
  details?: string;
  note?: string;
  approvedBy?: string;
  approvedAt?: Date;
  createdBy: string;
  created_at: Date;
  updated_at: Date;
}

export interface CreateWithdrawDTO {
  amount: number;
  business_id: string;
  payment_method: string;
  details?: string;
  note?: string;
}

export interface UpdateWithdrawDTO {
  status?: WithdrawStatus;
  payment_method?: string;
  details?: string;
  note?: string;
}

export interface ApproveWithdrawDTO {
  status: WithdrawStatus;
  note?: string;
}

