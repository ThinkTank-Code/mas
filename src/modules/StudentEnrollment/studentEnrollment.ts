import mongoose, { Schema, Document, Types } from 'mongoose';
import { Status } from '../../types/common';

interface IEnrolledStudent extends Document {
    student: Types.ObjectId;
    batch: Types.ObjectId;
    payment: Types.ObjectId;
    studentId: string;
    status: Status
}

const EnrolledStudentSchema: Schema = new Schema({
    student: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
    studentId: { type: String, required: true },
    batch: { type: Schema.Types.ObjectId, ref: 'Batch', required: true },
    payment: { type: Schema.Types.ObjectId, ref: 'Payment', required: true },
    status: {
        type: String,
        enum: Object.values(Status),
        default: Status.Pending
    }
},
    {
        timestamps: true,
    }
);

export const EnrolledStudentModel = mongoose.model<IEnrolledStudent>('EnrolledStudent', EnrolledStudentSchema);
