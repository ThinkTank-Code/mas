/**
 * Test Email Functions
 * This script sends test emails for all email functions to verify templates and functionality
 */

import {
    sendVerificationEmail,
    sendPasswordResetEmail,
    sendPaymentSuccessEmail,
    sendPaymentReviewEmail,
    sendPaymentFailedEmail,
    sendBatchStartReminderEmail,
    sendCertificateIssuedEmail,
    sendCertificateApprovedEmail,
    sendEnrollmentConfirmationEmail,
} from '../services/emailService';
import { connectDB } from '../config/database';

// Test email address - CHANGE THIS TO YOUR ACTUAL TEST EMAIL
const TEST_EMAIL = 'mh19711976@gmail.com';

async function testAllEmails() {
    console.log('🚀 Starting email tests...');

    // Connect to database first
    await connectDB();

    try {
        // // 1. Verification Email
        // console.log('📧 Sending verification email...');
        // await sendVerificationEmail(TEST_EMAIL, 'John Doe', 'test-verification-token-123');

        // // 2. Password Reset Email
        console.log('📧 Sending password reset email...');
        await sendPasswordResetEmail(TEST_EMAIL, 'John Doe', 'test-reset-token-456');

        // // 3. Payment Success Email
        // console.log('📧 Sending payment success email...');
        // await sendPaymentSuccessEmail(
        //     TEST_EMAIL,
        //     'John Doe',
        //     5000,
        //     'BDT',
        //     'Complete Web Development Course',
        //     'TXN-TEST-789'
        // );

        // // 4. Payment Review Email
        // console.log('📧 Sending payment review email...');
        // await sendPaymentReviewEmail(
        //     { name: 'John Doe', email: TEST_EMAIL, amount: 5000 },
        //     'Complete Web Development Course',
        //     'TXN-TEST-790'
        // );

        // // 5. Payment Failed Email
        // console.log('📧 Sending payment failed email...');
        // await sendPaymentFailedEmail(
        //     { name: 'John Doe', email: TEST_EMAIL, amount: 5000 },
        //     'Complete Web Development Course',
        //     'Payment gateway timeout'
        // );

        // // 6. Batch Start Reminder Email
        // console.log('📧 Sending batch start reminder email...');
        // await sendBatchStartReminderEmail(
        //     TEST_EMAIL,
        //     'John Doe',
        //     'Batch 2026 - Morning Session',
        //     'January 20, 2026'
        // );

        // // 7. Certificate Issued Email
        // console.log('📧 Sending certificate issued email...');
        // await sendCertificateIssuedEmail(
        //     TEST_EMAIL,
        //     'John Doe',
        //     'Complete Web Development Course',
        //     'CERT-TEST-123456'
        // );

        // // 8. Certificate Approved Email
        // console.log('📧 Sending certificate approved email...');
        // await sendCertificateApprovedEmail(
        //     TEST_EMAIL,
        //     'John Doe',
        //     'Complete Web Development Course',
        //     'CERT-TEST-123456'
        // );

        // 9. Enrollment Confirmation Email
        console.log('📧 Sending enrollment confirmation email...');
        await sendEnrollmentConfirmationEmail(
            { name: 'John Doe', email: TEST_EMAIL },
            'Complete Graphic Design Course',
            'ENROLL-TEST-78759',
            4000
        );

        console.log('✅ All test emails queued successfully!');
        console.log('📬 Check your email inbox (and spam folder) for the test emails.');
        console.log('⏰ Emails are queued and will be sent by the background worker.');

    } catch (error) {
        console.error('❌ Error sending test emails:', error);
    }
}

// Run the test
testAllEmails().catch(console.error);