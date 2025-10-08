export interface Student {
  id: string;
  parent_name: string;
  child_name: string;
  email: string;
  phone?: string;
  address?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateStudentData {
  parent_name: string;
  child_name: string;
  email: string;
  phone?: string;
  address?: string;
}

export interface UpdateStudentData extends Partial<CreateStudentData> {
  id: string;
}
