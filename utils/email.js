const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // 1. create a transporter
  const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: process.env.MAIL_PORT,
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASSWORD,
    },
  });

  // 2. define the email options
  const mailOptions = {
    form: 'Vu Kien <vutrungkien@test.com>',
    to: options.email,
    subject: options.subject,
    text: options.message,
    //html:
  };

  // 3. actually send the email
  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
