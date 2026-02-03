interface ValidationResult {
  isValid: boolean;
  message: string;
}

export const CheckPassword = (password: string): string | undefined => {
  if (!password) return undefined;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const isLongEnough = password.length >= 7 && password.length < 15;
  if (!isLongEnough) {
    return "The password must be betweneen 7 and 14 charachters";
  }
  if (!hasUpperCase) {
    return "The password must contain at least 1 Uppercase letter";
  }
  if (!hasNumber) {
    return "The password must contain at least 1 number";
  }
  return undefined;
};

export const CheckConfirmPassword = (
  password: string,
  confirmpassword: string,
): string => {
  if (password === confirmpassword) {
    return undefined;
  }
  return "The passwords doesnt match";
};
