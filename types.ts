
export enum TransactionType {
  ENTRY = 'ENTRADA',
  EXIT = 'SAÍDA'
}

export interface Student {
  id: string;
  name: string;
  class: string;
}

export interface Part {
  id: string; // e.g., T1, T2
  code: string; // SENAI Code
  name: string;
  targetQuantity: number;
}

export interface Transaction {
  id: string;
  date: string;
  type: TransactionType;
  description: string;
  partId: string;
  quantity: number;
}

export interface StudentWithdrawal {
  studentId: string;
  partId: string;
  date: string;
}

export interface StockSummary {
  partId: string;
  code: string;
  entries: number;
  exits: number;
  studentExits: number;
  balance: number;
  situation: 'OK' | 'COMPRAR';
  toBuy: number;
}
