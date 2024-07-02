import { ChangeEvent, ReactNode } from "react";
import { titleize } from "../utils";
import styles from "./Select.module.css";
import { RoomType } from "../models/rooms";

interface SelectProps {
  children: ReactNode;
  name: string;
  onChange: (roomType: RoomType) => void;
  value: RoomType;
}

export default function Select({
  children,
  name,
  onChange,
  value,
}: SelectProps) {
  function handleChange(e: ChangeEvent<HTMLSelectElement>) {
    e.preventDefault();
    onChange(e.target.value as RoomType);
  }

  return (
    <div className={styles.select}>
      <label className={styles.selectLabel} htmlFor={name}>
        {titleize(name)}
      </label>
      <select
        className={styles.selectInput}
        onChange={handleChange}
        value={value}
      >
        {children}
      </select>
    </div>
  );
}
