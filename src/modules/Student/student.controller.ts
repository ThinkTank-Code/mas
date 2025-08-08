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

const webhook = catchAsync(async (req: Request, res: Response) => {
    console.log("webhook called: ", req.body, req.query, req.params)
    const result = await StudentService.webhook(req.body);

    sendResponse(res, {
        statusCode: 201,
        success: true,
        message: 'Webhook called successfully !',
        data: result,
    });
});

const getAllStudents = catchAsync(async (req: Request, res: Response) => {
    console.log("query: ", req.query)
    const result = await StudentService.getAllStudents(req.query);

    sendResponse(res, {
        statusCode: 201,
        success: true,
        message: 'Student Retrive successfully !',
        meta: result.meta,
        data: result.data,
    });
});



export const StudentController = {
    enrollStudent,
    webhook,
    getAllStudents
}
