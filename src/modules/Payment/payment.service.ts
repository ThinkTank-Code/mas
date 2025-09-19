import mongoose, { PipelineStage } from "mongoose";
import { PaymentModel } from "./payment.model";
import { Status } from "../../types/common";
import { EnrolledStudentModel } from "../StudentEnrollment/studentEnrollment";
import ApiError from "../../errors/ApiError";
import { StatusCodes } from "http-status-codes";
import { sendPaymentEmail } from "../../utils/sendEmail";
import { StudentModel } from "../Student/student.model";

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

// const getPaymentHistory = async (query: PaymentHistoryQuery) => {
//     const {
//         page = 1,
//         limit = 10,
//         search,
//         status,
//         method,
//         studentId,
//         sortBy = "createdAt",
//         sortOrder = "desc",
//     } = query;

//     const filters: Record<string, any> = {};

//     if (status) {
//         filters.status = status;
//     }

//     if (method) {
//         filters.method = method;
//     }

//     if (studentId) {
//         filters.studentId = studentId;
//     }

//     const searchStage: PipelineStage[] = [];
//     if (search) {
//         searchStage.push({
//             $match: {
//                 $or: [
//                     { transactionId: { $regex: search, $options: "i" } },
//                 ],
//             },
//         });
//     }

//     const pipeline: PipelineStage[] = [
//         { $match: filters },
//         ...searchStage,
//         {
//             $lookup: {
//                 from: "students", // collection name in MongoDB
//                 localField: "studentId",
//                 foreignField: "_id",
//                 as: "student",
//             },
//         },
//         { $unwind: "$student" },
//         {
//             $project: {
//                 transactionId: 1,
//                 amount: 1,
//                 status: 1,
//                 method: 1,
//                 createdAt: 1,
//                 gatewayResponse: { $ifNull: ["$gatewayResponse", {}] },
//                 "student._id": 1,
//                 "student.name": 1,
//                 "student.email": 1,
//                 "student.phone": 1
//             },
//         },
//         {
//             $sort: {
//                 [sortBy]: sortOrder === "asc" ? 1 : -1,
//             },
//         },
//         {
//             $skip: (page - 1) * limit,
//         },
//         {
//             $limit: limit,
//         },
//     ];

//     const data = await PaymentModel.aggregate(pipeline);

//     const totalDocuments = await PaymentModel.countDocuments(filters);

//     return {
//         meta: {
//             total: totalDocuments,
//             page,
//             limit,
//             totalPages: Math.ceil(totalDocuments / limit),
//         },
//         data,
//     };
// };


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

    const pipeline: PipelineStage[] = [
        { $match: filters },
        {
            $lookup: {
                from: "students",
                localField: "studentId",
                foreignField: "_id",
                as: "student",
            },
        },
        { $unwind: "$student" },
    ];

    // Add search stage if search query exists
    if (search) {
        pipeline.push({
            $match: {
                $or: [
                    { transactionId: { $regex: search, $options: "i" } },
                    { "student.name": { $regex: search, $options: "i" } },
                    { "student.email": { $regex: search, $options: "i" } },
                ],
            },
        });
    }

    pipeline.push(
        {
            $project: {
                transactionId: 1,
                amount: 1,
                status: 1,
                method: 1,
                createdAt: 1,
                gatewayResponse: { $ifNull: ["$gatewayResponse", {}] },
                "student._id": 1,
                "student.name": 1,
                "student.email": 1,
                "student.phone": 1,
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
        }
    );

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

        let userEmail: string | undefined;
        let studentData: {
            name: string,
            email: string,
            studentId: string,
            status: Status,
            amount: number
        } = {
            name: "",
            email: "",
            studentId: "",
            status: Status.Pending,
            amount: 0
        }
        if (updatedEnrollment?.student) {
            const student = await StudentModel.findById(updatedEnrollment.student);
            if (student) {
                const EnrolledData = await EnrolledStudentModel.findOne({ student: student._id }).populate("payment")
                studentData.name = student.name;
                studentData.email = student.email;
                studentData.studentId = EnrolledData?.studentId as string;
                studentData.status = paymentStatus;
                studentData.amount = 4000;
            }
            userEmail = student?.email;
        }

        if (userEmail) {
            if (paymentStatus === Status.Success) {
                await sendPaymentEmail(userEmail, "success", studentData);
            } else if (paymentStatus === Status.Review) {
                await sendPaymentEmail(userEmail, "review", studentData);
            } else {
                await sendPaymentEmail(userEmail, "failed", studentData);
            }
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

const checkPaymentStatus = async (tran_id: string) => {
    // Find payment record
    const payment = await PaymentModel.findOne({ transactionId: tran_id });
    if (!payment) {
        throw new ApiError(StatusCodes.NOT_FOUND, "Payment data not found!")
    }

    // Optionally, fetch enrollment info
    const enrollment = await EnrolledStudentModel.findOne({
        student: payment.studentId,
        payment: payment._id
    });

    // Determine frontend redirect URL based on status
    let redirectUrl = "/";
    switch (payment.status) {
        case Status.Success:
            redirectUrl = "/payment?status=success";
            break;
        case Status.Pending:
            redirectUrl = "/payment?status=failed";
            break;
        case Status.Failed:
            redirectUrl = "/payment?status=failed";
            break;
        default:
            redirectUrl = "/payment?status=failed";
    }

    return {
        redirectUrl
    };
};

export const PaymentService = {
    getPaymentHistory,
    updatePaymentWithEnrollStatus,
    checkPaymentStatus
}