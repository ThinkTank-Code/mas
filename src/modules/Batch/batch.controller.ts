import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { BatchService } from "./batch.service";

const createBatch = catchAsync(async (req: Request, res: Response) => {
    const result = await BatchService.createBatch(req.body);

    sendResponse(res, {
        statusCode: 201,
        success: true,
        message: 'Batch Created successfully !',
        data: result,
    });
});

const getAllBatches = catchAsync(async (req: Request, res: Response) => {
    const result = await BatchService.getAllBatches();

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: 'Batch Retrive successfully !',
        data: result,
    });
});

const getBatchById = catchAsync(async (req: Request, res: Response) => {
    const id = req.params.id;
    const result = await BatchService.getBatchById(id);

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: 'Batch Retrive successfully !',
        data: result,
    });
});

const updateBatch = catchAsync(async (req: Request, res: Response) => {
    const id = req.params.id;
    const data = req.body;
    const result = await BatchService.updateBatch(id, data);

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: 'Batch updated successfully !',
        data: result,
    });
});

export const BatchController = {
    createBatch,
    getAllBatches,
    getBatchById,
    updateBatch
}
