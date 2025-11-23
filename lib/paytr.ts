import crypto from 'crypto'

export interface PayTRInitParams {
  merchantId: string
  merchantKey: string
  merchantSalt: string
  email: string
  paymentAmount: number
  merchantOid: string
  userIp: string
  userBasket: string
  testMode?: string
  noInstallment?: number
  maxInstallment?: number
  currency?: string
  lang?: string
}

export interface PayTRResponse {
  status: string
  token?: string
  reason?: string
}

/**
 * Initialize PayTR payment
 * This creates the token and parameters needed for PayTR iframe
 */
export async function initPayTRPayment(params: PayTRInitParams): Promise<PayTRResponse> {
  const {
    merchantId,
    merchantKey,
    merchantSalt,
    email,
    paymentAmount,
    merchantOid,
    userIp,
    userBasket,
    testMode = '1',
    noInstallment = 0,
    maxInstallment = 0,
    currency = 'TL',
    lang = 'tr',
  } = params

  // Create hash string
  const hashStr = `${merchantId}${userIp}${merchantOid}${email}${paymentAmount}${userBasket}${noInstallment}${maxInstallment}${testMode}${currency}${lang}${merchantSalt}`
  
  const hash = crypto
    .createHash('sha256')
    .update(hashStr)
    .digest('base64')

  const postData = {
    merchant_id: merchantId,
    user_ip: userIp,
    merchant_oid: merchantOid,
    email,
    payment_amount: paymentAmount * 100, // PayTR expects amount in kuruş (cents)
    paytr_token: hash,
    user_basket: userBasket,
    debug_on: testMode,
    no_installment: noInstallment,
    max_installment: maxInstallment,
    user_name: email.split('@')[0],
    user_address: '',
    user_phone: '',
    merchant_ok_url: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/odeme/paytr-success`,
    merchant_fail_url: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/odeme/paytr-fail`,
    timeout_limit: 30,
    currency: currency,
    lang: lang,
  }

  try {
    const response = await fetch('https://www.paytr.com/odeme/api/get-token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams(
        Object.entries(postData).map(([key, value]) => [key, String(value)])
      ),
    })

    const data = await response.json()

    if (data.status === 'success') {
      return {
        status: 'success',
        token: data.token,
      }
    } else {
      return {
        status: 'error',
        reason: data.reason || 'Payment initialization failed',
      }
    }
  } catch (error) {
    console.error('PayTR init error:', error)
    return {
      status: 'error',
      reason: 'Network error',
    }
  }
}

/**
 * Verify PayTR callback hash
 */
export function verifyPayTRCallback(
  merchantSalt: string,
  merchantOid: string,
  status: string,
  totalAmount: string,
  hash: string
): boolean {
  const hashStr = `${merchantSalt}${merchantOid}${status}${totalAmount}`
  const calculatedHash = crypto
    .createHash('sha256')
    .update(hashStr)
    .digest('base64')

  return calculatedHash === hash
}

/**
 * Format basket for PayTR (JSON array of [product_name, price, quantity])
 */
export function formatBasket(items: Array<{ name: string; price: number; quantity: number }>): string {
  return Buffer.from(JSON.stringify(items)).toString('base64')
}

