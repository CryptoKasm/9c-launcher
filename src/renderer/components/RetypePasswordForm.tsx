import {
  Button,
  FormControl,
  FormHelperText,
  InputLabel,
  OutlinedInput,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";
import React, { useState, ChangeEvent, MouseEvent } from "react";
import zxcvbn, { ZXCVBNFeedbackWarning } from "zxcvbn";
import { RetypePassword } from "../../interfaces/i18n";
import { T } from "@transifex/react";
import { t } from "@transifex/native";
import VisibilityAdornment from "./VisibilityAdornment";

interface RetypePasswordFormProps {
  onSubmit: (password: string, activationKey: string) => void;
  useActivationKey: boolean;
}

// XXX: Since Transifex reads the translation code by static analysis, it had to be hadcoded.
const passwordHints: Record<ZXCVBNFeedbackWarning, string> = {
  "A word by itself is easy to guess": t("A word by itself is easy to guess", {
    _tags: "zxcvbn",
  }),
  "Common names and surnames are easy to guess": t(
    "Common names and surnames are easy to guess",
    { _tags: "zxcvbn" }
  ),
  "Dates are often easy to guess": t("Dates are often easy to guess", {
    _tags: "zxcvbn",
  }),
  "Names and surnames by themselves are easy to guess": t(
    "Names and surnames by themselves are easy to guess",
    { _tags: "zxcvbn" }
  ),
  "Recent years are easy to guess": t("Recent years are easy to guess", {
    _tags: "zxcvbn",
  }),
  'Repeats like "aaa" are easy to guess': t(
    'Repeats like "aaa" are easy to guess',
    { _tags: "zxcvbn" }
  ),
  'Repeats like "abcabcabc" are only slightly harder to guess than "abc"': t(
    'Repeats like "abcabcabc" are only slightly harder to guess than "abc"',
    { _tags: "zxcvbn" }
  ),
  "Sequences like abc or 6543 are easy to guess": t(
    "Sequences like abc or 6543 are easy to guess",
    { _tags: "zxcvbn" }
  ),
  "Short keyboard patterns are easy to guess": t(
    "Short keyboard patterns are easy to guess",
    { _tags: "zxcvbn" }
  ),
  "Straight rows of keys are easy to guess": t(
    "Straight rows of keys are easy to guess",
    { _tags: "zxcvbn" }
  ),
  "This is a top-10 common password": t("This is a top-10 common password", {
    _tags: "zxcvbn",
  }),
  "This is a top-100 common password": t("This is a top-100 common password", {
    _tags: "zxcvbn",
  }),
  "This is a very common password": t("This is a very common password", {
    _tags: "zxcvbn",
  }),
  "This is similar to a commonly used password": t(
    "This is similar to a commonly used password",
    { _tags: "zxcvbn" }
  ),
  "Use a longer keyboard pattern with more turns": t(
    "Use a longer keyboard pattern with more turns",
    { _tags: "zxcvbn" }
  ),
  "": "",
};

const RetypePasswordForm = ({
  onSubmit,
  useActivationKey,
}: RetypePasswordFormProps) => {
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [passwordConfirmAllowsEmpty, setPasswordConfirmAllowsEmpty] = useState(
    true
  );
  const [activationKey, setActivationKey] = useState("");
  const [activationKeyAllowsEmpty, setActivationKeyAllowsEmpty] = useState(
    true
  );

  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);

  const classes = createStyle();

  const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);

    if (e.target.value.trim().length === 0) {
      setPasswordConfirmAllowsEmpty(true);
    }
  };

  const handlePasswordConfirmChange = (e: ChangeEvent<HTMLInputElement>) => {
    setPasswordConfirm(e.target.value);

    if (password.trim().length > 0) {
      setPasswordConfirmAllowsEmpty(false);
    }
  };

  const handleShowPassword = (e: MouseEvent<HTMLButtonElement>) => {
    setShowPassword(!showPassword);
  };

  const handleShowPasswordConfirm = (e: MouseEvent<HTMLButtonElement>) => {
    setShowPasswordConfirm(!showPasswordConfirm);
  };

  const handleActivationKeyChange = (e: ChangeEvent<HTMLInputElement>) => {
    setActivationKey(e.target.value);
    setActivationKeyAllowsEmpty(false);
  };

  const validateActivationKey = (code: string) => {
    if (code === null) {
      return false;
    }

    code = code.trim();
    if (code.length === 0 || code.indexOf("/") < 0) {
      return false;
    }

    const splits = code.split("/");
    const privateKey = splits[0];
    const address = splits[1];
    if (privateKey.length !== 64 || address.length !== 40) {
      return false;
    }

    return true;
  };

  const isPasswordEmpty = password.trim().length === 0;
  const isPasswordConfirmEmpty = passwordConfirm.trim().length === 0;
  const isPasswordConfirmError = isPasswordConfirmEmpty
    ? !passwordConfirmAllowsEmpty
    : password !== passwordConfirm;
  const isActivationKeyEmpty = activationKey.trim().length === 0;
  const isActivationKeyError = isActivationKeyEmpty
    ? !activationKeyAllowsEmpty
    : !validateActivationKey(activationKey);
  const disabled =
    isPasswordEmpty ||
    isPasswordConfirmEmpty ||
    isPasswordConfirmError ||
    (useActivationKey ? isActivationKeyEmpty || isActivationKeyError : false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (disabled) return;
    onSubmit(password, activationKey);
  };

  function strengthHint(password: string) {
    const { warning } = zxcvbn(password).feedback;
    if (warning === "") return "";
    return passwordHints[warning];
  }

  return (
    <form noValidate autoComplete="off" onSubmit={handleSubmit}>
      <FormControl
        fullWidth
        error={password.length > 0 && isPasswordEmpty}
        className={classes.formControl}
      >
        <InputLabel className={classes.label}>
          <T _str="Password" _tags="retypePassword" />
        </InputLabel>
        <OutlinedInput
          id="password-input"
          onChange={handlePasswordChange}
          type={showPassword ? "text" : "password"}
          endAdornment={
            <VisibilityAdornment
              onClick={handleShowPassword}
              show={showPassword}
            />
          }
        />
        <FormHelperText className={classes.helperText}>
          {password.length > 0 && strengthHint(password)}
        </FormHelperText>
      </FormControl>
      <FormControl
        fullWidth
        error={isPasswordConfirmError}
        className={classes.formControl}
      >
        <InputLabel className={classes.label}>
          <T _str="Password (Confirm)" _tags="retypePassword" />
        </InputLabel>
        <OutlinedInput
          id="password-confirm-input"
          type={showPasswordConfirm ? "text" : "password"}
          onChange={handlePasswordConfirmChange}
          endAdornment={
            <VisibilityAdornment
              onClick={handleShowPasswordConfirm}
              show={showPasswordConfirm}
            />
          }
        />
        <FormHelperText className={classes.helperText}>
          {passwordConfirm.length > 0 && strengthHint(passwordConfirm)}
        </FormHelperText>
      </FormControl>
      {useActivationKey ? (
        <FormControl
          fullWidth
          error={isActivationKeyError}
          className={classes.formControl}
        >
          <InputLabel className={classes.label}>
            <T _str="Invitation Code" _tags="retypePassword" />
          </InputLabel>
          <OutlinedInput type="text" onChange={handleActivationKeyChange} />
          <FormHelperText className={classes.helperText}>
            form helper text
          </FormHelperText>
        </FormControl>
      ) : (
        <></>
      )}
      <Button
        disabled={disabled}
        color="primary"
        type="submit"
        className={classes.submit}
        variant="contained"
      >
        <T _str="Done" _tags="retypePassword" />
      </Button>
    </form>
  );
};

export default RetypePasswordForm;

const createStyle = makeStyles({
  formControl: {
    marginBottom: "0.5em",
  },
  label: {
    marginLeft: "14px",
  },
  helperText: {
    height: "38px",
  },
  submit: {
    display: "block",
    margin: "0 auto 0 auto",
    width: "200px",
    height: "50px",
  },
});
