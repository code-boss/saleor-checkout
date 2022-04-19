import {
  ConfirmButtonTransitionState,
  OffsettedList,
  OffsettedListBody,
  OffsettedListItem,
  OffsettedListItemCell,
  useOffsettedListWidths,
} from "@saleor/macaw-ui";
import { ExpandMore as ExpandMoreIcon } from "@material-ui/icons";
// import { useRouter } from "next/router";
import { FormattedMessage } from "react-intl";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Switch,
  Typography,
} from "@material-ui/core";
import {
  ChannelActivePaymentProviders,
  ChannelPaymentOptions,
} from "types/api";
import { paymentProviders } from "config/fields";
import { useStyles } from "./styles";
import { channelListPath, channelPath, paymentProviderPath } from "routes";
import { messages } from "./messages";
import AppLayout from "@/frontend/components/elements/AppLayout";
import {
  flattenSettingId,
  mapNodesToItems,
  mapNodeToItem,
} from "@/frontend/utils";
import { Item } from "types/common";
import Skeleton from "@material-ui/lab/Skeleton";
import AppSavebar from "@/frontend/components/elements/AppSavebar";
import { Controller, useForm } from "react-hook-form";
import { getActivePaymentProvider, getFormDefaultValues } from "./data";
import { useEffect } from "react";
import { ChannelFragment } from "@/graphql";
import { useDashboardRouter } from "@/frontend/hooks/useDashboardRouter";

interface ChannelDetailsProps {
  channelPaymentOptions: ChannelPaymentOptions;
  channels: ChannelFragment[];
  saveButtonBarState: ConfirmButtonTransitionState;
  loading: boolean;
  onSubmit: (data: ChannelActivePaymentProviders) => void;
}

const ChannelDetails: React.FC<ChannelDetailsProps> = ({
  channelPaymentOptions,
  channels,
  saveButtonBarState,
  loading,
  onSubmit,
}) => {
  const dashboardRouter = useDashboardRouter();
  const classes = useStyles();
  const { actions } = useOffsettedListWidths();
  const {
    control,
    handleSubmit: handleSubmitForm,
    formState,
    reset: resetForm,
  } = useForm({
    shouldUnregister: true, // Legacy fields from different subpage using the same form might be still present, this should unregister them
  });

  useEffect(() => {
    resetForm(getFormDefaultValues(channelPaymentOptions)); // Update values on subpage change as the same form is used
  }, [channelPaymentOptions, resetForm]);

  const onBackClick = () => {
    dashboardRouter.push(channelListPath);
  };

  const onSettingsClick = () => {
    dashboardRouter.push({
      pathname: paymentProviderPath,
      query: {
        paymentProviderId: paymentProviders[0].id,
        channelId: channelPaymentOptions.channel.id,
      },
    });
  };

  const onChannelClick = (channel: Item) => {
    dashboardRouter.push({
      pathname: channelPath,
      query: { channelId: channel.id },
    });
  };

  const handleCancel = () => {
    resetForm(getFormDefaultValues(channelPaymentOptions));
  };

  const handleSubmit = (flattenedSettings: Record<string, string>) => {
    onSubmit({
      [channelPaymentOptions.channel.id]: flattenedSettings,
    } as ChannelActivePaymentProviders);
  };

  return (
    <form>
      <AppLayout
        title={channelPaymentOptions.channel.name}
        onBackClick={onBackClick}
        onSettingsClick={onSettingsClick}
        items={mapNodesToItems(channels)}
        selectedItem={mapNodeToItem(channelPaymentOptions.channel)}
        loading={loading}
        onItemClick={onChannelClick}
      >
        <Typography variant="subtitle1">
          <FormattedMessage {...messages.selectPaymentMethods} />
        </Typography>
        {loading ? (
          <Skeleton />
        ) : (
          channelPaymentOptions.paymentOptions.map(
            (paymentOption, paymentOptionIdx) => (
              <Accordion
                key={paymentOption.method.id}
                className={classes.paymentOption}
                elevation={0}
              >
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  className={classes.paymentOptionExpander}
                >
                  <div className={classes.paymentOptionIcon}></div>
                  <Typography variant="subtitle2">
                    {paymentOption.method.name}
                  </Typography>
                </AccordionSummary>
                <AccordionDetails className={classes.paymentOptionDetails}>
                  <OffsettedList gridTemplate={["1fr", actions(1)]}>
                    <Controller
                      key={paymentOption.id}
                      name={paymentOption.id}
                      control={control}
                      defaultValue={getActivePaymentProvider(paymentOption)}
                      render={({ field }) => (
                        <OffsettedListBody>
                          {paymentOption.availableProviders.map((provider) => (
                            <OffsettedListItem
                              key={provider.id}
                              className={classes.paymentMethod}
                            >
                              <OffsettedListItemCell>
                                {provider.label}
                              </OffsettedListItemCell>
                              <OffsettedListItemCell padding="action">
                                <Switch
                                  name={flattenSettingId(
                                    paymentOptionIdx,
                                    provider.id
                                  )}
                                  checked={field.value === provider.id}
                                  onChange={() =>
                                    field.onChange({
                                      target: {
                                        name: paymentOption.id,
                                        value:
                                          field.value === provider.id
                                            ? ""
                                            : provider.id,
                                      },
                                    })
                                  }
                                  onBlur={field.onBlur}
                                />
                              </OffsettedListItemCell>
                            </OffsettedListItem>
                          ))}
                        </OffsettedListBody>
                      )}
                    />
                  </OffsettedList>
                </AccordionDetails>
              </Accordion>
            )
          )
        )}
      </AppLayout>
      <AppSavebar
        disabled={loading || !formState.isDirty}
        state={saveButtonBarState}
        onCancel={handleCancel}
        onSubmit={handleSubmitForm(handleSubmit)}
      />
    </form>
  );
};
export default ChannelDetails;
