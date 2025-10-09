export interface Clase {
  id: string;
  title: string;
  description: string | null;
  date: string; // ISO date string
  time: string; // HH:MM:SS format
  minStudents: number;
  maxStudents: number;
  enrolled: number; // number of students currently enrolled
  price: number;
  classDuration: number; // duration in minutes
  class_type?: 'mini-chef' | 'mom-me'; // type of cooking class
  menu?: string[]; // array of menu items
  image_url?: string; // optional image URL
  created_at: string;
  updated_at: string;
}

// Cocinarte-specific class types
export type CocinarteClassType = 
  | 'kids-basics'
  | 'teen-culinary'
  | 'family-workshop'
  | 'birthday-party'
  | 'healthy-cooking'
  | 'baking-fundamentals'
  | 'private-event'
  | 'mini-chef'
  | 'mom-me';

export interface CocinarteClase extends Clase {
  classType?: CocinarteClassType;
  ageGroup?: string;
  skillLevel?: 'beginner' | 'intermediate' | 'advanced';
}

export interface CreateClaseData {
  title: string;
  description?: string;
  date: string;
  time: string;
  minStudents: number;
  maxStudents: number;
  enrolled?: number; // optional, defaults to 0
  price: number;
  classDuration: number;
  class_type?: 'mini-chef' | 'mom-me';
  menu?: string[];
  image_url?: string;
}

export interface UpdateClaseData extends Partial<CreateClaseData> {
  id: string;
}
