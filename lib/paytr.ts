import crypto from 'crypto'

// Get PayTR credentials from environment variables
export function getPayTRConfig() {
  const merchantId = process.env.PAYTR_MERCHANT_ID
  const merchantKey = process.env.PAYTR_MERCHANT_KEY
  const merchantSalt = process.env.PAYTR_MERCHANT_SALT
  const testMode = process.env.PAYTR_TEST_MODE || '1'

  if (!merchantId || !merchantKey || !merchantSalt) {
    throw new Error('PayTR credentials are not configured. Please check your environment variables.')
  }

  return {
    merchantId,
    merchantKey,
    merchantSalt,
    testMode,
  }
}

export interface PayTRInitParams {
  email: string
  paymentAmount: number // Amount in TL
  merchantOid: string
  userIp: string
  userBasket: string
  userName: string
  userAddress: string
  userPhone: string
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
  const config = getPayTRConfig()
  
  const {
    email,
    paymentAmount,
    merchantOid,
    userIp,
    userBasket,
    userName,
    userAddress,
    userPhone,
    testMode = config.testMode,
    noInstallment = 0,
    maxInstallment = 0,
    currency = 'TL',
    lang = 'tr',
  } = params

  // Payment amount in kuruş (cents)
  const paymentAmountKurus = Math.round(paymentAmount * 100)

  // Create hash string according to PayTR documentation
  // merchant_id + user_ip + merchant_oid + email + payment_amount + user_basket + no_installment + max_installment + test_mode + currency + lang + merchant_salt
  const hashStr = `${config.merchantId}${userIp}${merchantOid}${email}${paymentAmountKurus}${userBasket}${noInstallment}${maxInstallment}${testMode}${currency}${lang}${config.merchantSalt}`
  
  // Calculate HMAC-SHA256 hash
  const hash = crypto
    .createHmac('sha256', config.merchantKey)
    .update(hashStr)
    .digest('base64')

  // Base URL for redirect URLs
  const baseUrl = process.env.NEXTAUTH_URL || process.env.VERCEL_URL 
    ? `https://${process.env.VERCEL_URL || 'zensticker.com.tr'}` 
    : 'https://zensticker.com.tr'

  const postData = {
    merchant_id: config.merchantId,
    user_ip: userIp,
    merchant_oid: merchantOid,
    email,
    payment_amount: paymentAmountKurus,
    paytr_token: hash,
    user_basket: userBasket,
    debug_on: testMode,
    no_installment: noInstallment,
    max_installment: maxInstallment,
    user_name: userName,
    user_address: userAddress,
    user_phone: userPhone,
    merchant_ok_url: `${baseUrl}/odeme/paytr-success`,
    merchant_fail_url: `${baseUrl}/odeme/paytr-fail`,
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
 * According to PayTR documentation: hash = HMAC-SHA256(merchant_salt + merchant_oid + status + total_amount, merchant_key)
 */
export function verifyPayTRCallback(
  merchantOid: string,
  status: string,
  totalAmount: string,
  hash: string
): boolean {
  const config = getPayTRConfig()
  
  // Create hash string: merchant_salt + merchant_oid + status + total_amount
  const hashStr = `${config.merchantSalt}${merchantOid}${status}${totalAmount}`
  
  // Calculate HMAC-SHA256 hash
  const calculatedHash = crypto
    .createHmac('sha256', config.merchantKey)
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

