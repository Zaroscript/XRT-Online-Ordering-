export interface Testimonial {
  id: string;
  name: string;
  feedback: string;
  image?: string;
  role: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateTestimonialDTO {
  name: string;
  feedback: string;
  image?: string;
  role: string;
  is_active?: boolean;
}

export interface UpdateTestimonialDTO {
  name?: string;
  feedback?: string;
  image?: string;
  role?: string;
  is_active?: boolean;
}
