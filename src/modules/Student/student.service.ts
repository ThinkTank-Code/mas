import { Request, Response } from "express";
import mongoose from "mongoose";
import { StudentModel } from "./student.model";
import { v4 as uuidv4 } from "uuid";
import axios from "axios";
import { BatchModel } from "../Batch/batch.model";
import { generateStudentId } from "./student.utils";
import { PaymentModel } from "../Payment/payment.model";
import env from "../../config/env";
import ApiError from "../../errors/ApiError";
import { StatusCodes } from "http-status-codes";

const enrollStudent = async (payload: any) => {
    const session = await mongoose.startSession();

    try {
        session.startTransaction();

        // 1. Find current batch (with session)
        const batch = await BatchModel.findOne({ isCurrent: true }).session(session);
        if (!batch) {
            throw new ApiError(StatusCodes.NOT_FOUND, "No current batch found!")
        }

        // 2. Generate student id
        const studentId = await generateStudentId(batch);

        // 3. Create student (with session)
        const student = await StudentModel.create(
            [
                {
                    name: payload.name,
                    email: payload.email,
                    phone: payload.phone,
                    address: payload.address,
                    batch: batch._id,
                    studentId,
                    paymentStatus: "pending",
                },
            ],
            { session }
        );

        // 4. Create payment (with session)
        const transactionId = uuidv4();

        const payment = await PaymentModel.create(
            [
                {
                    studentId: student[0]._id,
                    amount: batch.courseFee,
                    status: "pending",
                    transactionId,
                },
            ],
            { session }
        );

        console.log("payment ------- ", payment)

        // 5. Init payment at SSLCommerz (outside transaction)
        const sslCommerzPayload = {
            store_id: env.SSL_STORE_ID,
            store_passwd: env.SSL_STORE_PASSWORD,
            total_amount: batch.courseFee,
            currency: "BDT",
            tran_id: transactionId,
            success_url: `${env.SERVER_URL}/api/v1/payment/status?status=success&t=${transactionId}`,
            fail_url: `${process.env.SERVER_URL}/api/v1/payment/status?status=fail`,
            cancel_url: `${process.env.SERVER_URL}/api/v1/payment/status?status=cancel`,
            ipn_url: `${process.env.SERVER_URL}/api/v1/payment/ipn`,
            product_name: `Course Fee for ${batch.title}`,
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

        // const sslResponse = await axios.post(
        //     "https://sandbox.sslcommerz.com/gwprocess/v3/api.php",
        //     sslCommerzPayload
        // );

        const sslResponse = await axios({
            method: 'post',
            url: "https://sandbox.sslcommerz.com/gwprocess/v3/api.php",
            data: sslCommerzPayload,
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });

        console.log("ssl res ------- ", sslResponse)

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
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        console.error("Enrollment failed:", error);
        throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, "Internal server error")
    }
};


export const StudentService = {
    enrollStudent
}