import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { DashboardService } from "./dashboard.service";

const getDashboardMetaData = catchAsync(async (req: Request, res: Response) => {
    const result = await DashboardService.getDashboardMetaData();
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: 'Metadata Retrive successfully !',
        data: result,
    });
});


export const DashboardController = {
    getDashboardMetaData
}
