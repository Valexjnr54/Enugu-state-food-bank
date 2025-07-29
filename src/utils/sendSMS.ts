import axios, { AxiosError } from 'axios';

const termiiApiKey = process.env.TERMII_API_KEY || 'TLQvkk7mJcru5ajmXjD6BuEwrBPead7GNyltdUz9RZHpOEC9zfxlwbA6BqHjpn';
const termiiEndpoint = process.env.TERMII_ENDPOINT || 'https://api.ng.termii.com/api/sms/send';

function normalizePhoneNumber(phone: string): string {
  const digitsOnly = phone.replace(/\D/g, '');

  if (digitsOnly.startsWith('0')) {
    return '+234' + digitsOnly.slice(1);
  }

  if (digitsOnly.startsWith('234')) {
    return '+' + digitsOnly;
  }

  if (phone.startsWith('+234')) {
    return phone;
  }

  throw new Error('Invalid Nigerian phone number format.');
}

export async function  sendSMS(phoneNumber: string, message: string): Promise<void>  {
  try {
    const formattedNumber = normalizePhoneNumber(phoneNumber);
    // console.log('Formatted Phone Number:'+formattedNumber);
    
      const response = await axios.post(
        termiiEndpoint,
        {
          api_key: termiiApiKey,
          to: formattedNumber,
          sms:message,
          from:"N-Alert",
          type:"plain",
          channel:"dnd"
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
  
      console.log('SMS sent successfully:', response.data);
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        console.error('Error sending SMS:', error.response?.data || error.message);
      } else {
        console.error('Unknown error:', error);
      }
    }
}