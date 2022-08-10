import "./button.css";
import classNames from "classnames";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";

export const Button = ({ children, disabled, loading, ...rest }) => {
  return (
    <button
      disabled={loading || disabled}
      className={classNames("paas-button", {
        "pass-button-disabled": loading || disabled,
      })}
      {...rest}
    >
      {loading ? (
        <FontAwesomeIcon icon={faSpinner} spin style={{ marginRight: 10 }} />
      ) : null}
      {children}
    </button>
  );
};
