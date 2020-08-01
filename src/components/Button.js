import React from "react";
import clsx from "clsx";
import styles from "./styles/button.module.css";

const Button = ({
  className,
  onClick,
  disabled,
  children,
  variant = "fill",
  mode = "primary",
}) => {
  return (
    <button
      className={clsx(styles.button, styles[variant], styles[mode], className)}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

export default Button;
