import { ReactNode } from "react";

interface OptionProps {
  children: ReactNode;
  value: string;
}

export default function Option({ children, value }: OptionProps) {
  return <option value={value}>{children}</option>;
}
