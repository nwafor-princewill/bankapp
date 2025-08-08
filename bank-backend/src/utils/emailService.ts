// utils/emailService.ts
import nodemailer from 'nodemailer';

interface LoanApplicationData {
  userInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  loanDetails: {
    amount: string;
    term: string;
    employmentType: string;
    purpose: string;
    customPurpose?: string;
  };
  applicationId: string;
}

// Create transporter using your existing email credentials
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_FROM, // Your existing email from env
      pass: process.env.EMAIL_PASSWORD, // Your existing app password from env
    },
  });
};

export const sendLoanApplicationEmail = async (applicationData: LoanApplicationData) => {
  const transporter = createTransporter();
  
  const { userInfo, loanDetails, applicationId } = applicationData;
  
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .header { background-color: #03305c; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; }
        .info-section { background-color: #f8f9fa; padding: 15px; margin: 10px 0; border-radius: 5px; }
        .label { font-weight: bold; color: #03305c; }
        .footer { background-color: #e8742c; color: white; padding: 15px; text-align: center; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>New Loan Application</h1>
        <p>Application ID: ${applicationId}</p>
      </div>
      
      <div class="content">
        <div class="info-section">
          <h3>Applicant Information</h3>
          <p><span class="label">Name:</span> ${userInfo.firstName} ${userInfo.lastName}</p>
          <p><span class="label">Email:</span> ${userInfo.email}</p>
          <p><span class="label">Phone:</span> ${userInfo.phone}</p>
        </div>
        
        <div class="info-section">
          <h3>Loan Details</h3>
          <p><span class="label">Amount:</span> $${parseFloat(loanDetails.amount).toLocaleString()}</p>
          <p><span class="label">Term:</span> ${loanDetails.term} months</p>
          <p><span class="label">Employment Type:</span> ${loanDetails.employmentType.replace('-', ' ').toUpperCase()}</p>
          <p><span class="label">Purpose:</span> ${loanDetails.purpose === 'other' ? loanDetails.customPurpose : loanDetails.purpose.replace('-', ' ').toUpperCase()}</p>
        </div>
        
        <div class="info-section">
          <h3>Next Steps</h3>
          <p>Please review this application and contact the applicant within 24 hours.</p>
          <p>Application submitted on: ${new Date().toLocaleString()}</p>
        </div>
      </div>
      
      <div class="footer">
        <p>ZenaTrust Bank - Loan Processing Department</p>
      </div>
    </body>
    </html>
  `;

  const mailOptions = {
    from: process.env.EMAIL_FROM, // Send from your email (fanciitech@gmail.com)
    to: 'amalgamateedbank@gmail.com', // For testing - use your other email first
    // to: '' nwaforprincewill21@gmail.com, // Change to this after testing
    subject: `New Loan Application - ${applicationId}`,
    html: htmlContent,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Loan application email sent successfully');
    return true;
  } catch (error) {
    console.error('Error sending loan application email:', error);
    return false;
  }
};

// Add this entire function to the end of your emailService.ts file

// Helper function to generate a random 6-digit OTP
const generateOtp = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

interface OtpDetails {
  email: string;
  otp: string;
  firstName: string;
}

export const sendTransferOtpEmail = async (details: OtpDetails) => {
  const transporter = createTransporter();
  
  const { email, otp, firstName } = details;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; color: #333; }
        .container { max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px; }
        .header { background-color: #03305c; color: white; padding: 10px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { padding: 30px; text-align: center; }
        .otp-code { font-size: 36px; font-weight: bold; color: #e8742c; letter-spacing: 5px; margin: 20px 0; }
        .footer { font-size: 12px; color: #777; text-align: center; margin-top: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2>Your One-Time Password</h2>
        </div>
        <div class="content">
          <p>Hello ${firstName},</p>
          <p>Please use the following code to complete your transfer. This code is valid for 10 minutes.</p>
          <div class="otp-code">${otp}</div>
          <p>If you did not request this transfer, please contact our support team immediately.</p>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} Amalgamated Bank. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const mailOptions = {
    from: `"Amalgamated Bank" <${process.env.EMAIL_FROM}>`,
    to: email,
    subject: 'Your Transfer Verification Code',
    html: htmlContent,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Transfer OTP email sent successfully to:', email);
    return true;
  } catch (error) {
    console.error('Error sending OTP email:', error);
    return false;
  }
};