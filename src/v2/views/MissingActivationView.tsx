import React, { useEffect } from "react";
import { observer } from "mobx-react";
import Layout from "../components/core/Layout";
import H1 from "../components/ui/H1";
import { T } from "src/renderer/i18n";
import TextField from "../components/ui/TextField";
import { t } from "@transifex/native";
import { useForm } from "react-hook-form";
import { useHistory } from "react-router";
import { useStore } from "../utils/useStore";
import { CSS } from "../stitches.config";
import Button from "../components/ui/Button";
import { useActivation } from "../utils/useActivation";

const transifexTags = "v2/missing-activation-view";

const SidebarStyles: CSS = {
  padding: 52,
  boxSizing: "border-box",
  display: "flex",
  flexDirection: "column",
  "& > * + *": {
    marginTop: 16,
  },
  height: "100%",
  marginBottom: 52,
};

function MissingActivationView() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const history = useHistory();
  const account = useStore("account");

  const { activated } = useActivation(account.activationKey);

  const onSubmit = ({ activationKey }: { activationKey: string }) => {
    account.setActivationKey(activationKey!);
    history.push("/lobby?first");
  };

  useEffect(() => void (activated && history.push("/lobby")), [
    activated,
    history,
  ]);

  return (
    <Layout sidebar css={SidebarStyles}>
      <H1>
        <T _str="Retype your Invitation Code" _tags={transifexTags} />
      </H1>
      <p>
        <T
          _str="The previously entered invitation code is invalid or the invitation code has not been entered yet."
          _tags={transifexTags}
        />
      </p>
      <form onSubmit={handleSubmit(onSubmit)}>
        <TextField
          label={t("Invitation Code", { _tags: transifexTags })}
          invalid={errors.activationKey}
          {...register("activationKey", {
            required: true,
            pattern: /^[0-9a-f]+\/[0-9a-f]{40}$/,
          })}
        />
        <Button type="submit" variant="primary" centered>
          <T _str="Submit" _tags={transifexTags} />
        </Button>
      </form>
    </Layout>
  );
}

export default observer(MissingActivationView);
