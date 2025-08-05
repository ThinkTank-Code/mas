import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import { AdminAuthService } from "./admin.service";
import sendResponse from "../../utils/sendResponse";

const loginUser = catchAsync(async (req: Request, res: Response) => {
    const email = req.body.email;
    const password = req.body.password;
    const result = await AdminAuthService.login(email, password);

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: 'User logged in successfully !',
        data: result,
    });
});


export const AdminAuthController = {
    loginUser
}
