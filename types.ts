
export interface Member {
  id: string;
  userId?: string; // UUID do Supabase Auth
  role: 'admin' | 'member';
  name: string;
  email: string;
  phone?: string;
  address?: string;
  avatar?: string;
  joinedAt: string;
  joiaPaid: boolean;
  totalSavings: number;
  totalLoansTaken: number;
  eligibilityProgress: number; // 0 to 1 based on 50,000 MT target
}

export interface Saving {
  id: string;
  memberId: string;
  amount: number;
  date: string;
  lateFee: number;
  month: string; // "YYYY-MM"
}

export interface Loan {
  id: string;
  memberId: string;
  amount: number;
  interestRate: number; // usually 0.15
  requestedAt: string;
  dueDate: string;
  paidAt?: string;
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
