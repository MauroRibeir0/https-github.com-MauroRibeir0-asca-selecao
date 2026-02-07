
import { SystemSettings } from './types';

export const COLORS = {
  primary: '#aa0000', // Ribeiro Corporate Red
  dark: '#1a1a1a',
  background: '#f3f4f6',
  white: '#ffffff',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444'
};

export const INITIAL_SETTINGS: SystemSettings = {
  joiaAmount: 1000,
  minMensalidade: 2000,
  maxMensalidade: 5000,
  lateFeeRate: 0.15,
  minMovementForInterest: 50000,
  fixedInterestReturn: 7500,
  managementFeePerMember: 500,
  loanInterestRate: 0.15
};

export const CYCLE = {
  start: '2025-12-01',
  end: '2026-11-30'
};
