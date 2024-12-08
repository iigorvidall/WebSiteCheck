// pages/api/send-whatsapp.ts
import { NextApiRequest, NextApiResponse } from 'next';
import twilio from 'twilio';

const sendWhatsApp = async (req: NextApiRequest, res: NextApiResponse) => {
  const { phoneNumber, message } = req.body;

  const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);

  try {
    const response = await client.messages.create({
      body: message,
      from: 'whatsapp:+12762654144', // Twilio Sandbox WhatsApp number
      to: `whatsapp:${phoneNumber}`,
    });

    return res.status(200).json({ message: 'WhatsApp message sent successfully' });
  } catch (error) {
    console.error('Error sending WhatsApp message:', error);
    return res.status(500).json({ message: 'Failed to send WhatsApp message' });
  }
};

export default sendWhatsApp;
