import { Schema, model } from 'mongoose';

export interface ISettings {
  featuredEnrollmentCourse?: string; // Course ID
  featuredEnrollmentBatch?: string; // Batch ID

}

const settingsSchema = new Schema<ISettings>({
  featuredEnrollmentCourse: {
    type: String,
    ref: 'Course',
  },
  featuredEnrollmentBatch: {
    type: String,
    ref: 'Batch',
  },
}, {
  timestamps: true,
});



export const Settings = model<ISettings>('Settings', settingsSchema);