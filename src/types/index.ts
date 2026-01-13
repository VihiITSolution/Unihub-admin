// Common TypeScript types and interfaces

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'Student' | 'Staff';
  status: 'Active' | 'Inactive';
  joinedDate: string;
}

export interface University {
  id: string;
  name: string;
  location: string;
  totalStudents: number;
  totalCourses: number;
  status: 'Active' | 'Inactive';
}

export interface Course {
  id: string;
  name: string;
  universityId: string;
  duration: string;
  enrolledStudents: number;
  status: 'Active' | 'Inactive';
}

export interface Application {
  id: string;
  userId: string;
  courseId: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  submittedDate: string;
}

export interface StatData {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}
