import { verifyToken } from '../../middleware/verify-token.js';

const EMAILJS_SERVICE_ID = process.env.EMAILJS_SERVICE_ID;
const EMAILJS_TEMPLATE_ID = process.env.EMAILJS_TEMPLATE_ID;
const EMAILJS_PUBLIC_KEY = process.env.EMAILJS_PUBLIC_KEY;
const EMAILJS_PRIVATE_KEY = process.env.EMAILJS_PRIVATE_KEY;

const DEV_ORIGIN_URL = process.env.DEV_ORIGIN_URL;
const PROD_ORIGIN_URL = process.env.PROD_ORIGIN_URL;
const NETLIFY_ORIGIN_URL = process.env.NETLIFY_ORIGIN_URL;

const ALLOWED_ORIGINS = [DEV_ORIGIN_URL, PROD_ORIGIN_URL, NETLIFY_ORIGIN_URL];

const getCorsHeaders = (origin) => {
  if (ALLOWED_ORIGINS.includes(origin)) {
    return {
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };
  }
  return {
    'Access-Control-Allow-Origin': 'null',
  };
};

export async function handler(event) {
  const origin = event.headers.origin || '';

  const CORS_HEADERS = getCorsHeaders(origin);

  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: '',
    };
  }

  if (!event.body) {
    return {
      statusCode: 400,
      headers: CORS_HEADERS,
      body: JSON.stringify({ message: 'Request body is empty.' }),
    };
  }

  const authCheck = verifyToken(event);
  if ('statusCode' in authCheck) {
    return authCheck;
  }

  const { name, email, message } = JSON.parse(event.body);

  try {
    const response = await fetch(
      'https://api.emailjs.com/api/v1.0/email/send',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          origin: 'https://www.sarkiskerelian.com',
          ...CORS_HEADERS,
        },
        body: JSON.stringify({
          service_id: EMAILJS_SERVICE_ID,
          template_id: EMAILJS_TEMPLATE_ID,
          user_id: EMAILJS_PUBLIC_KEY,
          accessToken: EMAILJS_PRIVATE_KEY,
          template_params: {
            senderName: name,
            senderEmail: email,
            senderMessage: message,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      // throw new Error(errorText);
      return {
        statusCode: 500,
        headers: CORS_HEADERS,
        message: errorText,
      };
    }

    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify({
        status: 200,
        message: 'Email sent successfully',
        user: authCheck.user,
      }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({ status: 500, message: error.message }),
    };
  }
}
