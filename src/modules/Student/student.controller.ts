import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { StudentService } from "./student.service";

const enrollStudent = catchAsync(async (req: Request, res: Response) => {
    const result = await StudentService.enrollStudent(req.body);

    sendResponse(res, {
        statusCode: 201,
        success: true,
        message: 'Student enrollment created successfully !',
        data: result,
    });
});



export const StudentController = {
    enrollStudent
}
