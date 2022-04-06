const nodemailer = require('nodemailer');
const pug = require('pug');
const htmlToText = require('html-to-text');

module.exports = class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.name.split(' ')[0];
    this.url = url;
    this.from = `Vu Trung Kien <${process.env.EMAIL_FROM}>`;
  }

  // tao transport
  newTransport() {
    if (process.env.NODE_ENV === 'production') {
      // do something in real world
      // dung seninblue thay sendgrid
      return nodemailer.createTransport({
        host: process.env.MAIL_SENDINBLUE_HOST,
        port: process.env.MAIL_SENDINBLUE_PORT,
        auth: {
          user: process.env.MAIL_SENDINBLUE_USER,
          pass: process.env.MAIL_SENDINBLUE_PASSWORD,
        },
      });
    }

    return nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: process.env.MAIL_PORT,
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASSWORD,
      },
    });
  }

  //method send email
  async send(template, subject) {
    // 1) Render HTML based on a pug template
    const html = pug.renderFile(`${__dirname}/../views/email/${template}.pug`, {
      firstName: this.firstName,
      url: this.url,
      subject,
    });
    // 2) Define email options
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
      text: htmlToText.fromString(html),
    };
    // 3) Create a transport and send email
    await this.newTransport().sendMail(mailOptions);
  }

  async sendWelcome() {
    await this.send('welcome', 'welcome to the Natours family!');
  }

  async resetPassword() {
    await this.send(
      'resetPassword',
      'Your password reset token (valid in 10m)'
    );
  }
};
