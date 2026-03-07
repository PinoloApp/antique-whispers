export const validators = {
  required: (value: string) => value.trim().length > 0,
  minLength: (min: number) => (value: string) => value.trim().length >= min,
  maxLength: (max: number) => (value: string) => value.length <= max,
  email: (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()),
  phone: (value: string) => value.trim() === "" || /^[+]?[\d\s\-()]{6,20}$/.test(value.trim()),
  minNumber: (min: number) => (value: string) => {
    const n = parseFloat(value);
    return !isNaN(n) && n >= min;
  },
};

export type ValidationRule = {
  validate: (value: string) => boolean;
  message: { en: string; sr: string };
};

export const getFieldError = (
  value: string,
  rules: ValidationRule[],
  language: string
): string | null => {
  for (const rule of rules) {
    if (!rule.validate(value)) {
      return language === "en" ? rule.message.en : rule.message.sr;
    }
  }
  return null;
};

// Common field rules
export const nameRules: ValidationRule[] = [
  { validate: validators.required, message: { en: "Name is required", sr: "Ime je obavezno" } },
  { validate: validators.minLength(2), message: { en: "Minimum 2 characters", sr: "Minimum 2 karaktera" } },
];

export const emailRules: ValidationRule[] = [
  { validate: validators.required, message: { en: "Email is required", sr: "Email je obavezan" } },
  { validate: validators.email, message: { en: "Invalid email format", sr: "Nevažeći format email-a" } },
];

export const messageRules: ValidationRule[] = [
  { validate: validators.required, message: { en: "Message is required", sr: "Poruka je obavezna" } },
  { validate: validators.minLength(5), message: { en: "Minimum 5 characters", sr: "Minimum 5 karaktera" } },
];

export const phoneRules: ValidationRule[] = [
  { validate: validators.phone, message: { en: "Invalid phone format", sr: "Nevažeći format telefona" } },
];
