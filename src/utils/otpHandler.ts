import { PrismaClient } from "../models";

const prisma = new PrismaClient();

export async function generateOtp() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function storeOtp(userId: string, otp: string) {
    try {
    await prisma.user.update({
      where: { id: userId },
      data: {
        otp: parseInt(otp, 10), // Make sure to store as number
      },
    });

    // console.log(`OTP stored for user ${userId}`);
  } catch (error) {
    console.error(`Failed to store OTP for user ${userId}:`, error);
    throw error;
  }
}

export async function verifyStoredOtp(userId: string, otp: string) {
    try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { otp: true },
    });

    if (!user) {
      console.warn(`User not found: ${userId}`);
      return false;
    }

    const isMatch = user.otp === parseInt(otp, 10);

    if (!isMatch) {
      console.warn(`OTP mismatch for user ${userId}`);
    }

    if (isMatch) {
        await prisma.user.update({
            where: { id: userId },
            data: { otp: null },
        });
    }


    return isMatch;
  } catch (error) {
    console.error(`Failed to verify OTP for user ${userId}:`, error);
    throw error;
  }
}

export async function verifyOrderStoredOtp(userId: string, orderId: string, otp: string) {
    try {
    const order = await prisma.order.findUnique({
      where: { id: orderId, userId },
      select: { order_confirmation_otp: true },
    });

    if (!order) {
      console.warn(`Order not found: ${userId}`);
      return false;
    }

    const isMatch = order.order_confirmation_otp === parseInt(otp, 10);

    if (!isMatch) {
      console.warn(`OTP mismatch for user ${userId}`);
      return false;
    }

    if (isMatch) {
        await prisma.order.update({
            where: { id: orderId, userId },
            data: { order_confirmation_otp: null },
        });
    }
    return isMatch;
  } catch (error) {
    console.error(`Failed to verify OTP for user ${userId}:`, error);
    throw error;
  }
}