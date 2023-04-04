import { useEffect } from "react";

export default function (...params) {
  useEffect(() => {
    console.log(...params);
  }, params)
}