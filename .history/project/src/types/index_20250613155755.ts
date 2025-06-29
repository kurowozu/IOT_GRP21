export interface TeamMember {
  id: string;
  name: string;
  role: string;
  studentId: string;
}

export interface SensorData {
  id: string;
  sensor1Distance: number;
  sensor2Distance: number;
  timestamp: Date;
  status: 'normal' | 'warning' | 'danger';
}

export interface ButtonState {
  id: number;
  label: string;
  isPressed: boolean;
  lastPressed?: Date;
}

export interface DatabaseRecord {
  id: string;
  timestamp: Date;
  sensor1: number;
  sensor2: number;
  buttonStates: number[];
  alertLevel: 'low' | 'medium' | 'high';
  notes?: string;
}