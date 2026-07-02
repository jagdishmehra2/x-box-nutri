export interface FaqItem {
  id: number;
  question: string;
  answer: string;
}

export const faqs: FaqItem[] = [
  {
    id: 1,
    question: "Are all products sold by X-Box Nutrition authentic?",
    answer:
      "Yes. We source our supplements from trusted brands and authorized suppliers so you receive genuine, quality-checked products.",
  },
  {
    id: 2,
    question: "How do I choose the right supplement for my goal?",
    answer:
      "Start with your training goal, diet, and experience level. Review each product description and consult a qualified professional when needed.",
  },
  {
    id: 3,
    question: "Which payment methods do you accept?",
    answer:
      "You can pay securely using the payment options shown during checkout. Available methods may vary based on your location and order.",
  },
  {
    id: 4,
    question: "How long does delivery usually take?",
    answer:
      "Delivery times depend on your location and are estimated during checkout. You will receive tracking details once your order is dispatched.",
  },
  {
    id: 5,
    question: "Can I cancel or return my order?",
    answer:
      "Orders can be cancelled only before dispatch. Products are non-returnable once delivered.",
  },
  {
    id: 6,
    question: "How can I track my order?",
    answer:
      "Sign in and open your order history to check its current status. Dispatch updates and tracking information are also sent to your registered contact details.",
  },
];
