export interface LegalPolicySection {
  heading: string
  paragraphs: string[]
}

export interface LegalPage {
  slug: string
  path: string
  label: string
  title: string
  metaDescription: string
  intro: string
  sections: LegalPolicySection[]
}

export const legalPages: LegalPage[] = [
  {
    slug: 'terms-and-conditions',
    path: '/terms-and-conditions',
    label: 'Terms and Conditions',
    title: 'Terms and Conditions',
    metaDescription:
      'Read NutriStack terms and conditions for accounts, product listings, checkout, payments, and store usage.',
    intro:
      'These terms explain the conditions that apply when you browse NutriStack, create an account, place an order, or use our services.',
    sections: [
      {
        heading: 'Use of the website',
        paragraphs: [
          'By accessing this website or placing an order, you agree to use NutriStack only for lawful personal shopping and to provide accurate account, billing, delivery, and contact information.',
          'You are responsible for keeping your account access secure and for all activity carried out through your account.',
        ],
      },
      {
        heading: 'Product information',
        paragraphs: [
          'Product images, descriptions, prices, offers, stock status, and delivery timelines may change without prior notice.',
          'We try to keep listings accurate, but customers should review final product labels, ingredients, allergens, directions, and manufacturer warnings before use.',
        ],
      },
      {
        heading: 'Health disclaimer',
        paragraphs: [
          'Supplements are not a substitute for medical care, diagnosis, or treatment.',
          'If you are pregnant, nursing, under medical treatment, below the recommended age for a product, or have a health condition, consult a qualified professional before using any supplement.',
        ],
      },
      {
        heading: 'Orders and payments',
        paragraphs: [
          'Orders are confirmed only after required customer details, delivery details, stock availability, and payment status are validated.',
          'NutriStack may cancel, decline, or delay an order if payment fails, stock is unavailable, delivery information is incomplete, or misuse, fraud, or suspicious activity is detected.',
        ],
      },
      {
        heading: 'Store content',
        paragraphs: [
          'The NutriStack name, website content, product presentation, graphics, and interface elements may not be copied, reproduced, or misused without permission.',
        ],
      },
    ],
  },
  {
    slug: 'privacy-policy',
    path: '/privacy-policy',
    label: 'Privacy Policy',
    title: 'Privacy Policy',
    metaDescription:
      'Read NutriStack privacy policy for account data, order details, payment processing, delivery, and support.',
    intro:
      'This policy explains what information NutriStack collects and how we use it to operate the store and support customers.',
    sections: [
      {
        heading: 'Information we collect',
        paragraphs: [
          'When you sign in, place an order, save a delivery address, or contact support, we may collect details such as your name, email address, phone number, delivery address, order details, and account profile information.',
          'If you continue with Google sign-in, we receive basic profile details such as your name, email address, avatar, and sign-in provider so your account can be created and recognized securely.',
        ],
      },
      {
        heading: 'How we use information',
        paragraphs: [
          'We use account, cart, order, payment, address, and contact details to process purchases, calculate delivery, send order updates, provide support, prevent fraud, and improve the shopping experience.',
          'We may retain order and transaction records where required for legal, tax, accounting, dispute-resolution, or fraud-prevention purposes.',
        ],
      },
      {
        heading: 'Payments',
        paragraphs: [
          'Payment processing may be handled by third-party payment service providers such as Razorpay.',
          'NutriStack does not need to store complete card, UPI, netbanking, or banking details in the storefront to complete your order.',
        ],
      },
      {
        heading: 'Sharing and security',
        paragraphs: [
          'We do not sell your personal information.',
          'We may share only the details needed with service providers such as authentication, database, payment, shipping, analytics, or support systems that help run the store.',
          'We use reasonable technical and organizational safeguards to protect customer information, while no online system can be guaranteed to be completely secure.',
        ],
      },
      {
        heading: 'Customer requests',
        paragraphs: [
          'You can contact NutriStack support to ask about your account, order information, corrections, or data deletion requests, subject to legal, tax, fraud-prevention, and transaction record requirements.',
        ],
      },
    ],
  },
  {
    slug: 'shipping-policy',
    path: '/shipping-policy',
    label: 'Shipping Policy',
    title: 'Shipping Policy',
    metaDescription:
      'Read NutriStack shipping policy for delivery timelines, shipping charges, address accuracy, and order tracking.',
    intro:
      'This shipping policy explains how NutriStack handles delivery timelines, charges, dispatch, and customer delivery responsibilities.',
    sections: [
      {
        heading: 'Serviceable locations',
        paragraphs: [
          'NutriStack currently ships orders within India to serviceable pincodes accepted during checkout.',
          'If delivery charge calculation is unavailable for a product or pincode, checkout may prevent order placement until the issue is resolved.',
        ],
      },
      {
        heading: 'Delivery timelines',
        paragraphs: [
          'Delivery estimates are shown during checkout based on the selected address.',
          'Current checkout estimates are same-day delivery for pincode 262308 and 2-3 business days for other serviceable pincodes after order confirmation.',
          'Timelines may change because of stock availability, courier delays, weather, holidays, high order volume, or incorrect delivery details.',
        ],
      },
      {
        heading: 'Shipping charges',
        paragraphs: [
          'Shipping charges are calculated during checkout before payment.',
          'Selected local pincodes may receive a flat delivery charge, while other serviceable pincodes may be charged based on total order weight.',
        ],
      },
      {
        heading: 'Dispatch and tracking',
        paragraphs: [
          'After an order is confirmed and dispatched, order status and delivery updates are available from your NutriStack account order history.',
          'Tracking or dispatch updates may also be sent to the registered contact details provided with the order.',
        ],
      },
      {
        heading: 'Address responsibility',
        paragraphs: [
          'Customers must provide a complete and accurate name, phone number, address, city, state, and pincode.',
          'NutriStack is not responsible for delays, failed delivery, or additional delivery charges caused by incomplete or incorrect delivery information.',
        ],
      },
    ],
  },
  {
    slug: 'contact-us',
    path: '/contact-us',
    label: 'Contact Us',
    title: 'Contact Us',
    metaDescription:
      'Contact NutriStack support for order, payment, delivery, cancellation, refund, and product queries.',
    intro:
      'For order, payment, delivery, cancellation, refund, or product questions, contact NutriStack support using the details below.',
    sections: [
      {
        heading: 'Customer support',
        paragraphs: [
          'Email support is available for customer queries, payment questions, delivery updates, cancellations, refunds, and product assistance.',
          'For faster support, include your order ID, registered email address or phone number, payment reference if available, and a short description of the issue.',
        ],
      },
      {
        heading: 'Support hours',
        paragraphs: [
          'Support hours are Monday to Saturday, 10:00 AM to 7:00 PM IST, excluding major public holidays.',
          'Messages received outside support hours are reviewed on the next working day.',
        ],
      },
    ],
  },
  {
    slug: 'cancellation-and-refunds',
    path: '/cancellation-and-refunds',
    label: 'Cancellation and Refunds',
    title: 'Cancellation and Refunds',
    metaDescription:
      'Read NutriStack cancellation and refunds policy for order cancellation, non-returnable products, replacements, and refund timelines.',
    intro:
      'This policy explains when orders can be cancelled and how refunds or replacements are handled by NutriStack.',
    sections: [
      {
        heading: 'Order cancellation',
        paragraphs: [
          'Orders can be cancelled only before dispatch.',
          'To request cancellation, contact NutriStack support as soon as possible with your order ID and registered contact details.',
          'Once an order is dispatched, cancellation may not be available and the order will follow the delivery and return eligibility rules below.',
        ],
      },
      {
        heading: 'Returns and replacements',
        paragraphs: [
          'Supplement products are non-returnable once delivered because of hygiene, safety, and product integrity requirements.',
          'Opened, used, damaged, tampered, or unsealed supplement products are not eligible for return unless required by law.',
          'If you receive a wrong, missing, damaged, or defective item, contact support promptly with your order ID, photos or video of the package, and a description of the issue so we can review a replacement or refund.',
        ],
      },
      {
        heading: 'Refund method',
        paragraphs: [
          'Approved prepaid order refunds are processed to the original payment method used during checkout.',
          'Refund visibility in your account depends on the payment provider, bank, card network, or UPI provider after NutriStack initiates the refund.',
        ],
      },
      {
        heading: 'Refund timeline',
        paragraphs: [
          'Eligible refunds are usually initiated within 5-7 working days after approval.',
          'Bank or payment-provider settlement timelines may add extra time before the refunded amount appears in the customer account.',
        ],
      },
      {
        heading: 'Non-refundable cases',
        paragraphs: [
          'Shipping charges, failed delivery due to incorrect customer details, customer refusal after dispatch, and products returned without approval may not be refundable.',
        ],
      },
    ],
  },
]

export const legalPageLinks = legalPages.map(({ path, label }) => ({
  to: path,
  label,
}))
