import { Schema, model, Types } from "mongoose";
import { Status } from "../../types/common";

export interface IPayment {
    transactionId: string;
    studentId: Types.ObjectId;
    amount: number;
    status: "pending" | "success" | "failed";
    method: "SSLCommerz";
    gatewayResponse: any; // store full response object here
    createdAt?: Date;
    updatedAt?: Date;
}

const paymentSchema = new Schema<IPayment>(
    {
        transactionId: {
            type: String,
            required: true,
            unique: true,
        },
        studentId: {
            type: Schema.Types.ObjectId,
            ref: "Student",
            required: true,
        },
        amount: {
            type: Number,
            required: true,
        },
        status: {
            type: String,
            enum: Object.values(Status),
            default: Status.Pending,
        },
        method: {
            type: String,
            enum: ["SSLCommerz", "paytm"],
            default: "SSLCommerz",
        },
        gatewayResponse: {
            type: Schema.Types.Mixed,
        },
    },
    {
        timestamps: true,
    }
);

export const PaymentModel = model<IPayment>("Payment", paymentSchema);
