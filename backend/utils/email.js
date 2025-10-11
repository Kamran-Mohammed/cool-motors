const fs = require("fs");
const nodemailer = require("nodemailer");
const nodemailerSendgrid = require("nodemailer-sendgrid");
const { convert } = require("html-to-text");

module.exports = class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.name.split(" ")[0];
    this.url = url;
    this.from = `Kamran Mohanmed <${process.env.EMAIL_FROM}>`;
  }

  newTransport() {
    if (process.env.NODE_ENV === "production") {
      // console.log("sendgrid email sending");

      return nodemailer.createTransport(
        nodemailerSendgrid({
          apiKey: process.env.SENDGRID_APIKEY,
        })
      );
    }

    // console.log("mailtrap email sending");
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  async send(template, subject) {
    //sending the eamil
    let html = fs.readFileSync(
      `${__dirname}/emailMessages/${template}.html`,
      "utf-8"
    );
    html = html
      .replace(/{{firstName}}/g, this.firstName)
      .replace(/{{url}}/g, this.url);

    //mail options:
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
      text: convert(html),
    };

    //create a transport and send the email
    await this.newTransport().sendMail(mailOptions);
  }

  async sendWelcome() {
    await this.send("welcome", "Welcome to AutoFinds");
  }

  async sendPasswordReset() {
    await this.send(
      "passwordReset",
      "Your password reset token(valid for 10 mins only)"
    );
  }

  async sendVerificationEmail() {
    await this.send(
      "emailVerification",
      "Please verify your email address(valid for 24 hours)"
    );
  }

  async sendEmailUpdateVerification(newEmail) {
    this.to = newEmail;
    await this.send(
      "emailUpdateVerification",
      "Please verify your email address(valid for 24 hours)"
    );
  }

  async sendApprovalEmail() {
    await this.send("approval", "Your vehicle listing has been approved");
  }

  async sendDisapprovalEmail() {
    await this.send("disapproval", "Your vehicle listing has been disapproved");
  }

  async sendAdminNotificationEmail() {
    await this.send(
      "adminNotification",
      "A new vehicle has been submitted for approval"
    );
  }
};
