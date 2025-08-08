import { IBatch } from "../Batch/batch.model";
import { EnrolledStudentModel } from "../StudentEnrollment/studentEnrollment";
import { StudentModel } from "./student.model";

export async function generateStudentId(batch: IBatch): Promise<string> {
    const batchLastChar = batch.title.trim().slice(-1);
    const yearLastTwo = new Date().getFullYear().toString().slice(-2);

    // Count existing students in the batch for serial
    const count = await EnrolledStudentModel.countDocuments({ batch: batch._id });
    console.log({ count })

    // Serial number padded to 3 digits, start from 1
    const serialNumber = (count + 1).toString().padStart(3, "0");

    return `MA-${batchLastChar}${yearLastTwo}${serialNumber}`;
}
