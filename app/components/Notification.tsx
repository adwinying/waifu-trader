import {
  BanIcon,
  CheckIcon,
  ExclamationIcon,
  InformationCircleIcon,
  XIcon,
} from "@heroicons/react/outline";
import { useState } from "react";

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
    error: "alert-danger",
    warning: "alert-warning",
    info: "alert-info",
  }[notification.type];

  const [isActive, setIsActive] = useState(true);
  const onNotificationClose = () => setIsActive(false);

  if (!isActive) return null;

  return (
    <div className={`alert ${alertClass} mb-4`}>
      <div className="flex-1">
        <Icon className="flex-shrink-0 w-6 h-6 mx-2" />
        <label>
          <h4>{notification.message}</h4>
          {notification.detail && (
            <p className="text-sm text-base-content text-opacity-60">
              {notification.detail}
            </p>
          )}
        </label>
      </div>
      <div className="flex-none">
        <button
          type="button"
          className="btn btn-sm btn-ghost btn-square"
          onClick={onNotificationClose}
        >
          <XIcon />
        </button>
      </div>
    </div>
  );
}

export default Notification;
