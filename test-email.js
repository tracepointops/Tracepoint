const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransporter({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: 'lytlewayne@gmail.com',
    pass: 'exaswvoyxpbtpblx'
  }
});

async function testEmail() {
  try {
    const info = await transporter.sendMail({
      from: '"Wayne from Twenty" <lytlewayne@gmail.com>',
      to: 'lytlewayne@gmail.com',
      subject: 'Test Email from Twenty CRM',
      text: 'This is a test email to verify SMTP configuration.',
      html: '<b>This is a test email to verify SMTP configuration.</b>'
    });

    console.log('✅ Email sent successfully!');
    console.log('Message ID:', info.messageId);
    console.log('Preview URL:', nodemailer.getTestMessageUrl(info));
  } catch (error) {
    console.error('❌ Error sending email:');
    console.error('Error message:', error.message);
    console.error('Full error:', error);
  }
}

testEmail();
