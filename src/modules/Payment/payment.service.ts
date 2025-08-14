import mongoose, { PipelineStage } from "mongoose";
import { PaymentModel } from "./payment.model";
import { Status } from "../../types/common";
import { EnrolledStudentModel } from "../StudentEnrollment/studentEnrollment";

interface PaymentHistoryQuery {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    method?: string;
    studentId?: string;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
}

const getPaymentHistory = async (query: PaymentHistoryQuery) => {
    const {
        page = 1,
        limit = 10,
        search,
        status,
        method,
        studentId,
        sortBy = "createdAt",
        sortOrder = "desc",
    } = query;

    const filters: Record<string, any> = {};

    if (status) {
        filters.status = status;
    }

    if (method) {
        filters.method = method;
    }

    if (studentId) {
        filters.studentId = studentId;
    }

    const searchStage: PipelineStage[] = [];
    if (search) {
        searchStage.push({
            $match: {
                $or: [
                    { transactionId: { $regex: search, $options: "i" } },
                ],
            },
        });
    }

    const pipeline: PipelineStage[] = [
        { $match: filters },
        ...searchStage,
        {
            $lookup: {
                from: "students", // collection name in MongoDB
                localField: "studentId",
                foreignField: "_id",
                as: "student",
            },
        },
        { $unwind: "$student" },
        {
            $project: {
                transactionId: 1,
                amount: 1,
                status: 1,
                method: 1,
                createdAt: 1,
                "student._id": 1,
                "student.name": 1,
                "student.email": 1,
                "student.phone": 1
            },
        },
        {
            $sort: {
                [sortBy]: sortOrder === "asc" ? 1 : -1,
            },
        },
        {
            $skip: (page - 1) * limit,
        },
        {
            $limit: limit,
        },
    ];

    const data = await PaymentModel.aggregate(pipeline);

    const totalDocuments = await PaymentModel.countDocuments(filters);

    return {
        meta: {
            total: totalDocuments,
            page,
            limit,
            totalPages: Math.ceil(totalDocuments / limit),
        },
        data,
    };
};


const updatePaymentWithEnrollStatus = async (
    tran_id: string,
    paymentStatus: Status
) => {
    const session = await mongoose.startSession();

    try {
        session.startTransaction();

        // 1. Update Payment
        const updatedPayment = await PaymentModel.findOneAndUpdate(
            { transactionId: tran_id },
            { status: paymentStatus },
            { new: true, session }
        );

        if (!updatedPayment) {
            throw new Error("Payment not found");
        }

        // 2. Update EnrolledStudent linked to this payment
        const updatedEnrollment = await EnrolledStudentModel.findOneAndUpdate(
            { student: updatedPayment.studentId, payment: updatedPayment._id },
            { status: paymentStatus },
            { new: true, session }
        );

        if (!updatedEnrollment) {
            throw new Error("Enrolled student record not found");
        }

        // Commit transaction
        await session.commitTransaction();
        session.endSession();

        return {
            payment: updatedPayment,
            enrollment: updatedEnrollment,
        };
    } catch (error) {
        // Rollback transaction
        await session.abortTransaction();
        session.endSession();
        throw error;
    }
};

export const PaymentService = {
    getPaymentHistory,
    updatePaymentWithEnrollStatus
}