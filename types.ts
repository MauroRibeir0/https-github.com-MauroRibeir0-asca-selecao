
export interface Member {
  id: string;
  userId?: string; 
  role: 'admin' | 'member';
  name: string;
  email: string;
  phone?: string;
  address?: string;
  avatar?: string;
  joinedAt: string;
  joiaPaid: boolean;
  mustChangePassword: boolean; // Flag para primeiro acesso
  totalSavings: number;
  totalLoansTaken: number;
  eligibilityProgress: number; 
}

export interface Saving {
  id: string;
  memberId: string;
  amount: number;
  date: string;
  lateFee: number;
  month: string; 
}

export interface Loan {
  id: string;
  memberId: string;
  amount: number;
  interest_rate: number; 
  requested_at: string;
  due_date: string;
  paid_at?: string;
  status: 'active' | 'paid' | 'overdue';
  totalRepayment: number;
}

export interface SystemSettings {
  joiaAmount: number;
  minMensalidade: number;
  maxMensalidade: number;
  lateFeeRate: number;
  minMovementForInterest: number;
  fixedInterestReturn: number;
  managementFeePerMember: number;
  loanInterestRate: number;
}

export interface Meeting {
  id: string;
  date: string;
  status: 'completed' | 'pending';
  description: string;
}
