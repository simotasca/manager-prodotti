import { useState } from "react";

export default function useFormState() {
  const [formState, setFormState] = useState({});
  const addFormState = (key, value) => setFormState(previous => ({ ...previous, [key]: value }));

  function handleInputChange(event) {
    const target = event.target;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    addFormState(target.name, value);
  }

  function handleIntInputChange(event) {
    const target = event.target;
    const value = parseInt(target.value);
    addFormState(target.name, value);
  }

  return [formState, addFormState, handleInputChange, handleIntInputChange];
}