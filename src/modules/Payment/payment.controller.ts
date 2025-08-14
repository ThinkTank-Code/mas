import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { PaymentService } from "./payment.service";
import ApiError from "../../errors/ApiError";
import { StatusCodes } from "http-status-codes";

const getPaymentHistory = catchAsync(async (req: Request, res: Response) => {
    console.log("payment", req.query)
    const result = await PaymentService.getPaymentHistory(req.query);

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: 'Payment Retrive successfully !',
        meta: result.meta,
        data: result.data,
    });
});

const updatePaymentWithEnrollStatus = catchAsync(async (req: Request, res: Response) => {
    const tran_id = req.params.tran_id;
    const status = req.body.status;
    if (!tran_id || !status) throw new ApiError(StatusCodes.BAD_REQUEST, "Bad Request!")

    const result = await PaymentService.updatePaymentWithEnrollStatus(tran_id, status);

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: 'Payment updated successfully !',
        data: result,
    });
});


export const PaymentController = {
    getPaymentHistory,
    updatePaymentWithEnrollStatus
}
