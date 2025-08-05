import { Request, Response } from "express";
import mongoose from "mongoose";
import { StudentModel } from "./student.model";
import { v4 as uuidv4 } from "uuid";
import axios from "axios";
import { BatchModel } from "../Batch/batch.model";
import { generateStudentId } from "./student.utils";
import { PaymentModel } from "../Payment/payment.model";
import env from "../../config/env";

export const enrollStudent = async (req: Request, res: Response) => {
    const session = await mongoose.startSession();

    try {
        session.startTransaction();

        // 1. Find current batch (with session)
        const batch = await BatchModel.findOne({ isCurrent: true }).session(session);
        if (!batch) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({ message: "No current batch found" });
        }

        // 2. Generate student id
        const studentId = await generateStudentId(batch);

        // 3. Create student (with session)
        const student = await StudentModel.create(
            [
                {
                    name: req.body.name,
                    email: req.body.email,
                    phone: req.body.phone,
                    address: req.body.address,
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
                    student: student[0]._id,
                    amount: batch.courseFee,
                    status: "pending",
                    transactionId,
                    gateway: "sslcommerz",
                },
            ],
            { session }
        );

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
            cus_name: req.body.name,
            cus_email: req.body.email,
            cus_add1: req.body.address,
            cus_phone: req.body.phone,
        };

        const sslResponse = await axios.post(
            "https://sandbox.sslcommerz.com/gwprocess/v4/api.php",
            sslCommerzPayload
        );

        if (!sslResponse.data?.GatewayPageURL) {
            // Rollback if SSLCommerz failed
            await session.abortTransaction();
            session.endSession();
            return res.status(500).json({ message: "Failed to initiate payment" });
        }

        // Commit the transaction if all succeeded
        await session.commitTransaction();
        session.endSession();

        return res.status(201).json({
            message: "Student enrolled. Redirect to payment gateway.",
            paymentUrl: sslResponse.data.GatewayPageURL,
            studentId,
            transactionId,
        });
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        console.error("Enrollment failed:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};
