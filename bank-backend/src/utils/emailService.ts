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

interface OtpDetails {
  email: string;
  otp: string;
  firstName: string;
}

const sendBrevoEmail = async (emailData: any) => {
  if (!process.env.BREVO_API_KEY) {
    throw new Error('Missing Brevo API key in environment variables');
  }

  const response = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'api-key': process.env.BREVO_API_KEY
    },
    body: JSON.stringify(emailData)
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Brevo API Error:', {
      status: response.status,
      statusText: response.statusText,
      body: errorText
    });
    throw new Error(`Failed to send email: ${response.status} ${response.statusText}`);
  }

  return await response.json();
};

export const sendLoanApplicationEmail = async (applicationData: LoanApplicationData) => {
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

  const emailData = {
    sender: {
      name: 'ZenaTrust Bank',
      email: process.env.EMAIL_FROM
    },
    to: [
      {
        email: 'amalgamateedbank@gmail.com',
        name: 'ZenaTrust Loan Department'
      }
    ],
    subject: `New Loan Application - ${applicationId}`,
    htmlContent: htmlContent
  };

  try {
    await sendBrevoEmail(emailData);
    console.log('Loan application email sent successfully to:', emailData.to[0].email);
    return true;
  } catch (error) {
    console.error('Error sending loan application email:', error);
    throw error;
  }
};

export const sendTransferOtpEmail = async (details: OtpDetails, context: 'transfer' | 'signup' = 'transfer') => {
  const { email, otp, firstName } = details;

  const subject = context === 'signup' ? 'ZenaTrust Email Verification OTP' : 'Your Transfer Verification Code';
  const actionText = context === 'signup' ? 'complete your email verification for registration' : 'complete your transfer';
  const warningText = context === 'signup' 
    ? 'If you did not initiate this registration, please ignore this email or contact our support team.'
    : 'If you did not request this transfer, please contact our support team immediately.';

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
          <h2>${context === 'signup' ? 'Email Verification OTP' : 'Your One-Time Password'}</h2>
        </div>
        <div class="content">
          <p>Hello ${firstName},</p>
          <p>Please use the following code to ${actionText}. This code is valid for 10 minutes.</p>
          <div class="otp-code">${otp}</div>
          <p>${warningText}</p>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} ZenaTrust Bank. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const emailData = {
    sender: {
      name: 'ZenaTrust Bank',
      email: process.env.EMAIL_FROM
    },
    to: [
      {
        email: email,
        name: firstName
      }
    ],
    subject: subject,
    htmlContent: htmlContent
  };

  try {
    await sendBrevoEmail(emailData);
    console.log(`${context === 'signup' ? 'Signup' : 'Transfer'} OTP email sent successfully to:`, email);
    return true;
  } catch (error) {
    console.error('Error sending OTP email:', error);
    console.error('Email data:', JSON.stringify(emailData, null, 2));
    throw error;
  }
};

export const sendEmail = async (options: {
  to: string;
  subject: string;
  text: string;
}) => {
  const emailData = {
    sender: {
      name: 'ZenaTrust Bank',
      email: process.env.EMAIL_FROM
    },
    to: [
      {
        email: options.to
      }
    ],
    subject: options.subject,
    textContent: options.text
  };

  try {
    await sendBrevoEmail(emailData);
    console.log('Email sent successfully to:', options.to);
    return { success: true };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error };
  }
};