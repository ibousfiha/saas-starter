import { env } from "@saas-starter/env/server";
import nodemailer from "nodemailer";
import { Resend } from "resend";

export interface EmailMessage {
	html: string;
	subject: string;
	to: string;
}

export type SendEmail = (message: EmailMessage) => Promise<void>;

function createResendTransport(apiKey: string): SendEmail {
	const resend = new Resend(apiKey);
	return async (message) => {
		const { error } = await resend.emails.send({
			...message,
			from: env.FROM_EMAIL,
		});
		if (error) {
			throw new Error(`Resend failed to send email: ${error.message}`);
		}
	};
}

function createSmtpTransport(host: string): SendEmail {
	const transport = nodemailer.createTransport({
		auth: env.SMTP_USER
			? { pass: env.SMTP_PASSWORD, user: env.SMTP_USER }
			: undefined,
		host,
		port: env.SMTP_PORT,
		secure: env.SMTP_PORT === 465,
	});
	return async (message) => {
		await transport.sendMail({ ...message, from: env.FROM_EMAIL });
	};
}

function createTransport(): SendEmail {
	if (env.RESEND_API_KEY) {
		return createResendTransport(env.RESEND_API_KEY);
	}
	if (env.SMTP_HOST) {
		return createSmtpTransport(env.SMTP_HOST);
	}
	throw new Error(
		"No email transport configured: set RESEND_API_KEY or SMTP_HOST"
	);
}

export const sendEmail: SendEmail = createTransport();
