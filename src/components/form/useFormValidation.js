import { useState } from "react";

export default function useFormValidation(validateCallback) {
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    let isError = false;
    const addError = (field, value) => {
      newErrors[field] = value;
      isError = true;
    };
    validateCallback(addError);
    setErrors(newErrors);
    return !isError;
  };

  return [errors, validate];
}