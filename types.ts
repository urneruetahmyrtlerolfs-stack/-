
export enum UserRole {
  PRINCIPAL = 'PRINCIPAL',
  ACADEMIC = 'ACADEMIC',
  TEACHER = 'TEACHER',
  PARENT = 'PARENT'
}

export enum StaffPosition {
  LEAD_TEACHER = '班主任',
  ASSISTANT_TEACHER = '配班老师',
  NURSE = '保育员',
  OFFICE = '行政',
  SECURITY = '安保'
}

export interface User {
  id: string;
  name: string;
  role: UserRole;
  avatar?: string;
  className?: string;
}

export interface Staff {
  id: string;
  name: string;
  position: StaffPosition;
  phone: string;
  className?: string;
  entryDate: string;
}

export interface Student {
  id: string;
  name: string;
  gender: 'male' | 'female';
  age: number;
  className: string;
  parentName: string;
  phone: string;
  status: 'in' | 'out' | 'transfer';
  attendance?: 'present' | 'absent' | 'late';
  birthDate?: string;
}

export interface ClassInfo {
  id: string;
  name: string;
  leadTeacherId: string;
  assistantTeacherId: string;
  nurseId: string;
  studentCount: number;
}

export interface AuditRecord {
  id: string;
  title: string;
  submitter: string;
  type: 'plan' | 'activity' | 'expense';
  date: string;
  status: 'pending' | 'approved' | 'rejected';
  content: string;
  feedback?: string;
}

export interface Notification {
  id: string;
  title: string;
  content: string;
  date: string;
  read: boolean;
  sender: string;
}
