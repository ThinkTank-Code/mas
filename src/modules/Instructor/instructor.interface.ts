import { Types } from 'mongoose';

export interface ISocialLinks {
    linkedin?: string;
    portfolio?: string;
    github?: string;
}

export interface IInstructor {
    _id?: Types.ObjectId;
    userId: Types.ObjectId;
    bio: string;
    expertise: string[];
    socialLinks?: ISocialLinks;
    verified: boolean;
    rating?: number;
    totalBatchesTaught: number;
    status: 'active' | 'inactive';
    createdAt?: Date;
    updatedAt?: Date;
}

export interface IInstructorPopulated extends Omit<IInstructor, 'userId'> {
    userId: {
        _id: Types.ObjectId;
        name: string;
        email: string;
        avatar?: string;
    };
}
