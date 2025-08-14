import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { EnrolledStudentService } from "./studentEnrollment.service";

const getEnrolledStudents = catchAsync(async (req: Request, res: Response) => {
    const result = await EnrolledStudentService.getEnrolledStudents(req.query);
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: 'Student Retrive successfully !',
        meta: result.meta,
        data: result.data,
    });
});


export const EnrolledStudentController = {
    getEnrolledStudents
}
