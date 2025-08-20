import { Request, Response } from "express";
import mongoose, { FilterQuery } from "mongoose";
import { StudentModel } from "./student.model";
import { v4 as uuidv4 } from "uuid";
import axios from "axios";
import { BatchModel } from "../Batch/batch.model";
import { generateStudentId } from "./student.utils";
import { PaymentModel } from "../Payment/payment.model";
import env from "../../config/env";
import ApiError from "../../errors/ApiError";
import { StatusCodes } from "http-status-codes";
import { GetStudentsParams, IStudent } from "./student.interface";
import { EnrolledStudentModel } from "../StudentEnrollment/studentEnrollment";
import { Status } from "../../types/common";
import { sendPaymentEmail } from "../../utils/sendEmail";

const enrollStudent = async (payload: any) => {
    const session = await mongoose.startSession();

    try {
        session.startTransaction();

        // 1. Find current batch (with session)
        const batch = await BatchModel.findOne({ isCurrent: true }).session(session);

        if (!batch) {
            throw new ApiError(StatusCodes.NOT_FOUND, "No current batch found!")
        }

        // 2. Find Student with email
        const isStudentExists = await StudentModel.findOne({ email: payload.email })

        let student: any = isStudentExists;
        let isAlreadyEnrolled: any;
        // 3. The Student enrolled in current batch or not
        if (!isStudentExists) {
            const createStudent = await StudentModel.create(
                [
                    {
                        name: payload.name,
                        email: payload.email,
                        phone: payload.phone,
                        address: payload.address
                    },
                ],
                { session }
            );

            student = createStudent[0];
        }
        else {
            isAlreadyEnrolled = await EnrolledStudentModel.findOne({
                student: isStudentExists._id,
                batch: batch._id
            })
                .populate("payment")
                .session(session);

            if (
                isAlreadyEnrolled &&
                isAlreadyEnrolled.payment?.status === Status.Success &&
                isAlreadyEnrolled.status === Status.Success
            ) {
                throw new ApiError(StatusCodes.BAD_REQUEST, "You are already enrolled in the current batch!");
            }

            await StudentModel.findByIdAndUpdate(
                isStudentExists._id,
                {
                    name: payload.name,
                    phone: payload.phone,
                    address: payload.address,
                },
                { session }
            )
        }

        // 4. Create payment (with session)
        const transactionId = uuidv4();
        const studentId = await generateStudentId(batch);

        const payment = await PaymentModel.create(
            [
                {
                    studentId: student._id,
                    amount: batch.courseFee,
                    status: "pending",
                    transactionId,
                    method: payload.method
                },
            ],
            { session }
        );

        if (isAlreadyEnrolled) {
            await EnrolledStudentModel.findByIdAndUpdate(
                isAlreadyEnrolled._id,
                { payment: payment[0]._id },
                { session }
            );
        } else {
            await EnrolledStudentModel.create(
                [
                    {
                        student: student._id,
                        studentId: studentId,
                        batch: batch._id,
                        payment: payment[0]._id,
                    },
                ],
                { session }
            );
        }

        if (payload.method === "SSLCommerz") {
            // 5. Init payment at SSLCommerz (outside transaction)
            const sslCommerzPayload = {
                store_id: env.SSL_STORE_ID,
                store_passwd: env.SSL_STORE_PASSWORD,
                total_amount: batch.courseFee,
                currency: "BDT",
                tran_id: transactionId,
                success_url: `${env.SERVER_URL}/api/v1/payment/status?status=success&t=${transactionId}`,
                fail_url: `${env.SERVER_URL}/api/v1/payment/status?status=fail`,
                cancel_url: `${env.SERVER_URL}/api/v1/payment/status?status=cancel`,
                ipn_url: `${env.SERVER_URL}/api/v1/student/ipn`,
                product_name: `Graphics Design Course - ${batch.title}`,
                cus_name: payload.name,
                cus_email: payload.email,
                cus_add1: payload.address,
                cus_phone: payload.phone,
                shipping_method: 'N/A',
                product_category: 'Online Course',
                product_profile: 'general',
                cus_add2: 'N/A',
                cus_city: 'N/A',
                cus_state: 'N/A',
                cus_postcode: 'N/A',
                cus_country: 'Bangladesh',
                cus_fax: 'N/A',
                ship_name: 'N/A',
                ship_add1: 'N/A',
                ship_add2: 'N/A',
                ship_city: 'N/A',
                ship_state: 'N/A',
                ship_postcode: 1000,
                ship_country: 'Bangladesh',
            };

            const sslResponse = await axios({
                method: 'post',
                url: env.SSL_PAYMENT_API,
                data: sslCommerzPayload,
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            });

            if (!sslResponse.data?.GatewayPageURL) {
                throw new ApiError(StatusCodes.BAD_GATEWAY, "Failed to init payment!")
            }

            // Commit the transaction if all succeeded
            await session.commitTransaction();
            session.endSession();

            return {
                paymentUrl: sslResponse.data.GatewayPageURL,
                studentId,
                transactionId,
            };
        }
        else {
            console.log("payment data: ", payload.paymentData)
            await PaymentModel.findByIdAndUpdate(
                payment[0]._id,
                { gatewayResponse: payload.paymentData },
                { new: true, session }
            );
            await session.commitTransaction();
            session.endSession();
            return {
                message: "Payment info Submitted successfully! You will get confirmation message soon."
            }
        }
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        // @ts-ignore
        throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, error?.message || "Internal server error")
    }
};


const validate = async (data: any) => {
    try {
        const response = await axios({
            method: 'GET',
            url: `${env.SSL_VALIDATION_API}?val_id=${data.val_id}&store_id=${env.SSL_STORE_ID}&store_passwd=${env.SSL_STORE_PASSWORD}&format=json`
        })
        return response.data;
    }
    catch (err) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "Payment error!")
    }
}


const webhook = async (payload: any) => {
    if (!payload || !payload?.status) {
        return {
            massage: 'Invalid Payment!'
        }
    }

    const result = await validate(payload);
    const { tran_id } = result;

    // Find existing payment record
    const payment = await PaymentModel.findOne({ transactionId: tran_id });
    if (!payment) {
        return { message: 'Payment record not found!' };
    }

    const tranStatus = result.status.toUpperCase();

    let paymentStatus: string;

    switch (tranStatus) {
        case 'VALIDATED':
        case 'VALID': {
            const risk_level = result.risk_level ?? '0'; // Default low if missing

            if (risk_level === '1') {
                paymentStatus = Status.Review; // hold service for verification
            } else {
                paymentStatus = Status.Success;
            }
            break;
        }

        case 'INVALID_TRANSACTION':
            paymentStatus = Status.Failed;
            break;

        case 'CANCELLED':
            paymentStatus = Status.Cancel;
            break;
        default:
            paymentStatus = Status.Failed;
    }

    // Update payment status in DB
    const updatedPayment = await PaymentModel.findOneAndUpdate(
        { transactionId: tran_id },
        { status: paymentStatus, gatewayResponse: result },
        { new: true }
    );

    if (!updatedPayment) {
        return { message: 'Payment record not found to update!' };
    }

    const updateEnrollment = await EnrolledStudentModel.findOneAndUpdate(
        { student: updatedPayment.studentId, payment: updatedPayment._id },
        { status: paymentStatus },
        { new: true }
    )

    console.log({ updateEnrollment })

    // ---- Fetch student email ----
    let userEmail: string | undefined;
    if (updateEnrollment?.student) {
        const student = await StudentModel.findById(updateEnrollment.student);
        userEmail = student?.email;
    }
    // ---- Send Email ----
    if (userEmail) {
        if (paymentStatus === Status.Success) {
            await sendPaymentEmail(userEmail, "success", tran_id);
        } else if (paymentStatus === Status.Review) {
            await sendPaymentEmail(userEmail, "review", tran_id);
        } else {
            await sendPaymentEmail(userEmail, "failed", tran_id);
        }
    }

    return { tran_id, payload }
}


// get all students (filtering, searching, pagination)
const getAllStudents = async (params: GetStudentsParams) => {
    const {
        search,
        paymentStatus,
        batch,
        page = 1,
        limit = 10,
        sortBy = 'createdAt',
        sortOrder = 'desc'
    } = params;

    const filter: FilterQuery<IStudent> = {};

    if (search) {
        filter.$or = [
            { name: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } }
        ]
    }

    if (paymentStatus) {
        filter.paymentStatus = paymentStatus;
    }

    if (batch) {
        filter.batch = batch;
    }

    const skip = (Number(page) - 1) * limit;

    const sort: Record<string, 1 | -1> = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const total = await StudentModel.countDocuments(filter);

    const data = await StudentModel.find(filter)
        .populate('batch')
        .sort(sort)
        .skip(skip)
        .limit(Number(limit))
        .exec()

    return {
        data,
        meta: {
            total,
            page: Number(page),
            limit: Number(limit),
            totalPages: Math.ceil(total / limit)
        }
    }
}

export const StudentService = {
    enrollStudent,
    webhook,
    getAllStudents
}