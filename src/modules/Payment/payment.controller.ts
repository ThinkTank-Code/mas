import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { PaymentService } from "./payment.service";
import ApiError from "../../errors/ApiError";
import { StatusCodes } from "http-status-codes";
import { Status } from "../../types/common";
import env from "../../config/env";

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
    console.log({ tran_id, status })
    if (!tran_id || !status) throw new ApiError(StatusCodes.BAD_REQUEST, "Bad Request!")

    const result = await PaymentService.updatePaymentWithEnrollStatus(tran_id, status);

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: 'Payment updated successfully !',
        data: result,
    });
});

const checkPaymentStatus = catchAsync(async (req: Request, res: Response) => {
    const tran_id = req.query.t as string;
    const status = req.query.status as string;

    if (!status) throw new ApiError(StatusCodes.BAD_REQUEST, "Bad Request!")

    if (status === Status.Failed || status === Status.Cancel) {
        return res.redirect(`${env.FRONTEND_URL}/payment?status=failed`);
    }

    if (tran_id && status === Status.Success) {
        const result = await PaymentService.checkPaymentStatus(tran_id);
        return res.redirect(`${env.FRONTEND_URL}${result.redirectUrl}`);
    }
});


export const PaymentController = {
    getPaymentHistory,
    updatePaymentWithEnrollStatus,
    checkPaymentStatus
}
