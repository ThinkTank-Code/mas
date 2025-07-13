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

        console.log({ studentId })

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
            ipn_url: `https://1e38040386f1.ngrok-free.app/api/v1/student/ipn`,
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


const validate = async (data: any) => {
    try {
        const response = await axios({
            method: 'GET',
            url: `https://sandbox.sslcommerz.com/validator/api/validationserverAPI.php?val_id=${data.val_id}&store_id=${env.SSL_STORE_ID}&store_passwd=${env.SSL_STORE_PASSWORD}&format=json`
        })
        console.log(response);
        return response.data;
    }
    catch (err) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "Payment error")
    }
}


const webhook = async (payload: any) => {
    console.log("Payload: ", payload);
    if (!payload || !payload?.status || payload?.status !== 'VALID') {
        return {
            massage: 'Invalid Payment!'
        }
    }
    const result = await validate(payload);

    console.log({ result })
    //     {
    //   result: {
    //     status: 'VALID',
    //     tran_date: '2025-08-05 23:55:12',
    //     tran_id: '50b0e001-8d35-44b4-8028-b18c3dca3268',
    //     val_id: '250805235525g2u6Osnv9RhtmcS',
    //     amount: '4000.00',
    //     store_amount: '3900',
    //     currency: 'BDT',
    //     bank_tran_id: '2508052355250HXkauKNjexeiXv',
    //     card_type: 'BANKASIA-Bank Asia Internet Banking',
    //     card_no: '',
    //     card_issuer: 'Bank Asia Limited',
    //     card_brand: 'IB',
    //     card_category: 'IB',
    //     card_sub_brand: '',
    //     card_issuer_country: 'Bangladesh',
    //     card_issuer_country_code: 'BD',
    //     currency_type: 'BDT',
    //     currency_amount: '4000.00',
    //     currency_rate: '1.0000',
    //     base_fair: '0.00',
    //     value_a: '',
    //     value_b: '',
    //     value_c: '',
    //     value_d: '',
    //     emi_instalment: '0',
    //     emi_amount: '0.00',
    //     emi_description: '',
    //     emi_issuer: 'Bank Asia Limited',
    //     account_details: '',
    //     risk_title: 'Safe',
    //     risk_level: '0',
    //     discount_percentage: '0',
    //     discount_amount: '0.00',
    //     discount_remarks: '',
    //     APIConnect: 'DONE',
    //     validated_on: '2025-08-05 23:55:26',
    //     gw_version: '',
    //     offer_avail: 1,
    //     card_ref_id: 'dc1da4f52669828139e81ef5eb0f48a5a99ea054a131e00a562887d455417dd923',
    //     isTokeizeSuccess: 0,
    //     campaign_code: ''
    //   }
    // }

    if (result?.status !== 'VALID') {
        return {
            massage: 'Payment failed!'
        }
    }

    const { tran_id } = result;
    return { tran_id, payload }
}


export const StudentService = {
    enrollStudent,
    webhook
}