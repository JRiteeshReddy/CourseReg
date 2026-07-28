export interface Course {
  id: string;
  name: string;
  category: 'Sports' | 'Student Life';
  maxCapacity: number;
}

export const SPORTS_COURSES: Course[] = [
  { id: 'sp1', name: 'Volleyball', category: 'Sports', maxCapacity: 25 },
  { id: 'sp2', name: 'Basketball', category: 'Sports', maxCapacity: 25 },
  { id: 'sp3', name: 'Football', category: 'Sports', maxCapacity: 25 },
  { id: 'sp4', name: 'Tennis', category: 'Sports', maxCapacity: 25 },
  { id: 'sp5', name: 'Badminton', category: 'Sports', maxCapacity: 25 },
  { id: 'sp6', name: 'Table Tennis', category: 'Sports', maxCapacity: 25 },
  { id: 'sp7', name: 'Athletics', category: 'Sports', maxCapacity: 25 },
  { id: 'sp8', name: 'Swimming', category: 'Sports', maxCapacity: 25 },
];

export const STUDENT_LIFE_COURSES: Course[] = [
  { id: 'sl1', name: 'Drama', category: 'Student Life', maxCapacity: 25 },
  { id: 'sl2', name: 'Music', category: 'Student Life', maxCapacity: 25 },
  { id: 'sl3', name: 'Debate', category: 'Student Life', maxCapacity: 25 },
  { id: 'sl4', name: 'Photography', category: 'Student Life', maxCapacity: 25 },
  { id: 'sl5', name: 'Coding Club', category: 'Student Life', maxCapacity: 25 },
  { id: 'sl6', name: 'Art & Design', category: 'Student Life', maxCapacity: 25 },
  { id: 'sl7', name: 'Robotics', category: 'Student Life', maxCapacity: 25 },
  { id: 'sl8', name: 'Environment', category: 'Student Life', maxCapacity: 25 },
  { id: 'sl9', name: 'Entrepreneurship', category: 'Student Life', maxCapacity: 25 },
  { id: 'sl10', name: 'Literature', category: 'Student Life', maxCapacity: 25 },
  { id: 'sl11', name: 'Community Service', category: 'Student Life', maxCapacity: 25 },
];

export const ALL_COURSES = [...SPORTS_COURSES, ...STUDENT_LIFE_COURSES];
