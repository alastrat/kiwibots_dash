import React, { useMemo } from "react";
import dayjs from "dayjs";
import clsx from "clsx";
import Button from "components/Button";
import { ReactComponent as BotRight } from "assets/svg/bot-right.svg";
import { ReactComponent as BotCompromised } from "assets/svg/bot-compromised.svg";
import { ReactComponent as BotOk } from "assets/svg/bot-ok.svg";
import { ReactComponent as BotPicking } from "assets/svg/bot-picking.svg";
import { ReactComponent as BotWaiting } from "assets/svg/bot-waiting.svg";
import { ReactComponent as Check } from "assets/svg/check.svg";
import { ReactComponent as Time } from "assets/svg/time.svg";
import styles from "./styles/delivery.module.css";
import { kiwiLogoBlue } from "assets/images";

const LABEL_STATUS = {
  pending: "Order received",
  assigned: "Assigned",
  arriving_pickup: "Arriving pickup",
  at_pickup: "At Pickup",
  in_transit: "In Transit",
  arriving_dropoff: "Arriving Drop Off",
  at_dropoff: "At Drop Off",
  delivered: "Delivered",
  canceled: "Canceled",
  compromised: "Compromised",
};
const ITEM_STATUS = {
  current: "current",
  check: "check",
  pending: "pending",
};

const HOUR_FORMAT = "hh: mm A";

function FloatDelivery({
  status_history = [],
  manifest = {},
  worker_id = "",
  dropoff = {},
  external_id = "",
  status = "",
  estimated_delivery_at = "",
  className = "",
}) {
  const itemStatus = useMemo(() => {
    const { canceled, compromised, ...history } = {
      ...status_history,
    };
    const { canceled: _, compromised: __, ...labelStatus } = {
      ...LABEL_STATUS,
    };
    let itemsHistory = Object.keys(labelStatus);
    if (canceled) {
      return itemsHistory
        .filter((f) => !!history[f])
        .map((m) => ({
          label: LABEL_STATUS[m],
          status: ITEM_STATUS.check,
          time: dayjs(history[m]).format(HOUR_FORMAT),
        }))
        .concat([
          {
            label: LABEL_STATUS.canceled,
            status: ITEM_STATUS.check,
            time: dayjs(canceled).format(HOUR_FORMAT),
          },
        ]);
    } else if (compromised) {
      // const last2 = itemsHistory.reduce((a, c) =>
      //   new Date(history[a]) > new Date(history[c]) ? a : c
      // );
      const last = itemsHistory.findIndex((a) => !history[a]);

      return itemsHistory
        .slice(0, last)
        .map((m) => ({
          label: LABEL_STATUS[m],
          status: ITEM_STATUS.check,
          time: dayjs(history[m]).format(HOUR_FORMAT),
        }))
        .concat([
          {
            label: LABEL_STATUS.compromised,
            status: ITEM_STATUS.current,
            time: dayjs(compromised).format(HOUR_FORMAT),
            isCompromised: true,
          },
        ])
        .concat(
          itemsHistory.slice(last + 1).map((m) => ({
            label: LABEL_STATUS[m],
            status: ITEM_STATUS.pending,
            time: "",
          }))
        );
    } else {
      const getStatus = (key, value) => {
        if (key === status) {
          return ITEM_STATUS.current;
        } else if (!value) {
          return ITEM_STATUS.pending;
        } else {
          return ITEM_STATUS.check;
        }
      };
      return itemsHistory.map((m) => ({
        label: LABEL_STATUS[m],
        status: getStatus(m, history[m]),
        time: !!history[m] ? dayjs(history[m]).format(HOUR_FORMAT) : "",
      }));
    }
  }, [status, status_history]);

  const { BotState, colorStatus } = useMemo(() => {
    switch (status) {
      case "assigned":
      case "delivered":
        return { BotState: BotOk, colorStatus: "green" };
      case "at_pickup":
        return { BotState: BotPicking, colorStatus: "orange" };
      case "compromised":
        return { BotState: BotCompromised, colorStatus: "red" };
      case "at_dropoff":
        return { BotState: BotWaiting, colorStatus: "blue" };
      default:
        return { BotState: BotRight };
    }
  }, [status]);

  const delivery_at = useMemo(
    () =>
      estimated_delivery_at
        ? dayjs(estimated_delivery_at).format(HOUR_FORMAT)
        : "",
    [estimated_delivery_at]
  );

  return (
    <div className={clsx(styles["delivery-info-container"], className)}>
      <img
        className={styles["kiwibot-logo"]}
        src={kiwiLogoBlue}
        alt="kiwibot-logo-blue"
      />
      <BotState className={styles["bot-svg"]} />
      <span id="robot-id" className={styles["delivery-robot-name"]}>
        {worker_id}
      </span>
      <span
        id="robot-state"
        className={clsx(styles["delivery-state"], styles[colorStatus])}
      >
        {LABEL_STATUS[status]}
      </span>
      <ul className={styles["delivery-status-container"]}>
        {itemStatus.map((m) => (
          <li
            key={`delivery-status-item-${m.label}`}
            className={clsx(styles["delivery-status-item"], {
              [styles["delivery-status-compromised"]]: m.isCompromised,
              [styles["delivery-status-current"]]: m.status === ITEM_STATUS.current,
            })}
          >
            <div className={styles["delivery-status-svg"]}>
              {m.status === ITEM_STATUS.current ? (
                <Time />
              ) : (
                <Check
                  className={
                    m.status === ITEM_STATUS.pending
                      ? styles["svg-pending"]
                      : styles["svg-checked"]
                  }
                />
              )}
            </div>
            <div className={styles["delivery-status-info"]}>
              <b>{m.label}</b>
              {!!m.time && (
                <>
                  <br />
                  <span className="font-size-12">{m.time}</span>
                </>
              )}
            </div>
          </li>
        ))}
      </ul>
      {delivery_at && (
        <p className={styles["delivery-info"]}>
          <b>Delivery at:</b> {delivery_at}
          <br />
          <b>Delivery address:</b> {dropoff.street}
          <br />
          <b>Order id:</b> {external_id} Order
          <br />
          <b>Description:</b> {manifest.description}:{" "}
          {manifest.items.map((m) => `${m.name}x${m.quantity}`).join(", ")}.
        </p>
      )}
      <div className={styles["delivery-action-container"]}>
        {
          status && (
            <>
              <Button className={styles["button-action"]}>Toggle door</Button>
              <Button className={styles["button-action"]} mode="secondary">
                Ask for help
              </Button>
            </>
          )
        }
        <span className={styles["last-label"]}>Made with ❤ by Kiwibot</span>
      </div>
    </div>
  );
}
export default FloatDelivery;
