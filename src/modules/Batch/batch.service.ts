import { StatusCodes } from "http-status-codes";
import ApiError from "../../errors/ApiError";
import { BatchModel, IBatch } from "./batch.model";


export const BatchService = {
    createBatch: async (data: Partial<IBatch>) => {
        const isExists = await BatchModel.findOne({ title: data.title });
        if (isExists) {
            throw new ApiError(StatusCodes.CONFLICT, "Batch already exists!");
        }
        const batchData = {
            title: data.title,
            courseFee: data.courseFee
        }
        return await BatchModel.create(batchData);
    },

    getAllBatches: async () => {
        return await BatchModel.find().sort({ createdAt: -1 });
    },

    getBatchById: async (id: string) => {
        return await BatchModel.findById(id);
    },

    updateBatch: async (id: string, data: Partial<IBatch>) => {
        const isExists = await BatchModel.findById(id);
        if (!isExists) {
            throw new ApiError(StatusCodes.NOT_FOUND, "Batch not found!");
        }

        if (data.isCurrent === true) {
            await BatchModel.updateMany({}, { isCurrent: false });
        }
        return await BatchModel.findByIdAndUpdate(id, data, { new: true });
    },
};
