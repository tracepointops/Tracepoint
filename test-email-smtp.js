#!/usr/bin/env node
/**
 * Test SMTP Email Configuration
 * Tests if email settings work before running full app
 */

const nodemailer = require('nodemailer');
require('dotenv').config({ path: './packages/twenty-server/.env' });

const config = {
  host: process.env.EMAIL_SMTP_HOST,
  port: parseInt(process.env.EMAIL_SMTP_PORT),
  secure: process.env.EMAIL_SMTP_PORT === '465',
  auth: {
    user: process.env.EMAIL_SMTP_USER,
    pass: process.env.EMAIL_SMTP_PASSWORD,
  },
  tls: {
    rejectUnauthorized: process.env.EMAIL_SMTP_NO_TLS !== 'true'
  }
};

console.log('\n🧪 Testing SMTP Configuration...\n');
console.log('Config:', {
  host: config.host,
  port: config.port,
  user: config.auth.user,
  password: config.auth.pass ? '***' + config.auth.pass.slice(-4) : 'NOT SET',
  secure: config.secure,
});
console.log('\n');

const transporter = nodemailer.createTransport(config);

async function testConnection() {
  try {
    console.log('⏳ Verifying connection...');
    await transporter.verify();
    console.log('✅ SMTP connection successful!\n');

    console.log('📧 Sending test email...');
    const info = await transporter.sendMail({
      from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_FROM_ADDRESS}>`,
      to: process.env.EMAIL_SMTP_USER, // Send to self
      subject: 'Tracepoint Email Test',
      text: 'If you receive this, email is working correctly!',
      html: '<h1>✅ Email Working!</h1><p>Tracepoint CRM email is configured correctly.</p>',
    });

    console.log('✅ Test email sent successfully!');
    console.log('Message ID:', info.messageId);
    console.log('\n🎉 Email configuration is working!\n');

  } catch (error) {
    console.error('\n❌ SMTP Error:', error.message);
    console.error('\n');

    if (error.message.includes('Invalid login')) {
      console.log('🔧 FIX: Gmail App Password is invalid or expired');
      console.log('   1. Go to: https://myaccount.google.com/apppasswords');
      console.log('   2. Create new App Password for "Tracepoint CRM"');
      console.log('   3. Update EMAIL_SMTP_PASSWORD in .env');
      console.log('   4. Restart services: ./start-all-services.sh\n');
    } else if (error.message.includes('ECONNREFUSED')) {
      console.log('🔧 FIX: Cannot connect to SMTP server');
      console.log('   - Check EMAIL_SMTP_HOST and EMAIL_SMTP_PORT');
      console.log('   - Verify firewall/network settings\n');
    } else if (error.message.includes('ETIMEDOUT')) {
      console.log('🔧 FIX: Connection timeout');
      console.log('   - Check internet connection');
      console.log('   - Verify SMTP port is not blocked\n');
    }

    process.exit(1);
  }
}

testConnection();
