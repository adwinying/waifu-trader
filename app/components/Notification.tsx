import {
  BanIcon,
  CheckIcon,
  ExclamationIcon,
  InformationCircleIcon,
} from "@heroicons/react/outline";
import { XIcon } from "@heroicons/react/solid";
import { useEffect, useState } from "react";
import { useTransition } from "remix";

export type NotificationData = {
  type: "success" | "error" | "warning" | "info";
  message: string;
  detail?: string;
};

type Props = {
  notification: NotificationData;
};
function Notification({ notification }: Props) {
  const Icon = {
    success: CheckIcon,
    error: BanIcon,
    warning: ExclamationIcon,
    info: InformationCircleIcon,
  }[notification.type];

  const alertClass = {
    success: "alert-success",
    error: "alert-error",
    warning: "alert-warning",
    info: "alert-info",
  }[notification.type];

  const [isActive, setIsActive] = useState(true);
  const onNotificationClose = () => setIsActive(false);
  const { state } = useTransition();

  useEffect(() => {
    setIsActive(true);
  }, [notification]);

  useEffect(() => {
    if (state === "loading") setIsActive(false);
  }, [state]);

  if (!isActive) return null;

  return (
    <div className={`alert ${alertClass} mb-4`}>
      <div className="flex-1">
        <Icon className="mx-2 h-6 w-6 flex-shrink-0" />
        <label>
          <h4 cy-data="notificationTitle">{notification.message}</h4>
          {notification.detail && (
            <p
              className="text-sm text-base-content text-opacity-60"
              cy-data="notificationDetail"
            >
              {notification.detail}
            </p>
          )}
        </label>
      </div>
      <div className="flex-none">
        <button
          type="button"
          className="btn btn-ghost btn-square btn-sm"
          onClick={onNotificationClose}
        >
          <XIcon className="w-6" />
        </button>
      </div>
    </div>
  );
}

export default Notification;
