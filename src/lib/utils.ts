import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getLocalStorage() {
  let a: { [key: string]: string } = {};
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i) || "";
    const v = localStorage.getItem(k);
    if (k) {
      a[k] = v || "";
    }
  }
  const s = JSON.stringify(a);
  return s;
}

export function writeLocalStorage(data: string) {
  const o = JSON.parse(data);
  for (const property in o) {
    if (o.hasOwnProperty(property)) {
      localStorage.setItem(property, o[property]);
    }
  }
}
