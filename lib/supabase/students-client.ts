import { createClient } from './client';
import { Student, CreateStudentData, UpdateStudentData } from '../types/students';

export class StudentsClientService {
  private supabase = createClient();

  async getAllStudents(): Promise<Student[]> {
    const { data, error } = await this.supabase
      .from('students')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Error fetching students: ${error.message}`);
    }

    return data || [];
  }

  async getStudentById(id: string): Promise<Student | null> {
    const { data, error } = await this.supabase
      .from('students')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Not found
      }
      throw new Error(`Error fetching student: ${error.message}`);
    }

    return data;
  }

  async getStudentByEmail(email: string): Promise<Student | null> {
    const { data, error } = await this.supabase
      .from('students')
      .select('*')
      .eq('email', email)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Not found
      }
      throw new Error(`Error fetching student by email: ${error.message}`);
    }

    return data;
  }

  async createStudent(studentData: CreateStudentData): Promise<Student> {
    const { data, error } = await this.supabase
      .from('students')
      .insert([studentData])
      .select()
      .single();

    if (error) {
      throw new Error(`Error creating student: ${error.message}`);
    }

    return data;
  }

  async updateStudent(updateData: UpdateStudentData): Promise<Student> {
    const { id, ...updateFields } = updateData;
    
    const { data, error } = await this.supabase
      .from('students')
      .update(updateFields)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Error updating student: ${error.message}`);
    }

    return data;
  }

  async deleteStudent(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('students')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Error deleting student: ${error.message}`);
    }
  }

  async searchStudents(query: string): Promise<Student[]> {
    const { data, error } = await this.supabase
      .from('students')
      .select('*')
      .or(`parent_name.ilike.%${query}%,child_name.ilike.%${query}%,email.ilike.%${query}%`)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Error searching students: ${error.message}`);
    }

    return data || [];
  }
}
