export interface SubscriberData {
  firstName: string;
  lastName: string;
  email: string;
  streetAddress: string;
  postalCode: string;
  city: string;
  country: string;
  birthday: string;
}

export interface FAQItem {
  question: string;
  answer: string;
  id: string;
}

export interface IncludedItem {
  title: string;
  description: string;
  detail: string;
  iconName: string;
  badge?: string;
}
