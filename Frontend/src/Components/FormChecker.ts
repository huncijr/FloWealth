import filter from "leo-profanity";

export const ValidateName = (name: string): string | undefined => {
  filter.loadDictionary("en");
  const normalizedname = name.replace(/[^a-zA-Z0-9]/g, "");
  const isBad = filter.check(normalizedname) || filter.check(name);
  if (isBad) {
    return "The username cannot be used";
  }
  return undefined;
};

export const CheckPassword = (password: string): string | undefined => {
  if (!password) return undefined;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const isLongEnough = password.length >= 7 && password.length < 20;
  if (!isLongEnough) {
    return "The password must be betweneen 7 and 20 charachters";
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
): string | undefined => {
  if (password === confirmpassword) {
    return undefined;
  }
  return "The passwords doesnt match";
};
