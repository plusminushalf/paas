import React from "react";
import "./button.css";

const Button = (props) => {
  const { children, ...rest } = props;

  return (
    <button className="paas-button" {...rest}>
      {" "}
      {children}
    </button>
  );
};

export default Button;
