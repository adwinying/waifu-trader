import { ReactNode } from "react";

type Props = {
  children: ReactNode;
};

export default function PageTitle({ children }: Props) {
  return <h1 className="mb-6 text-5xl font-bold">{children}</h1>;
}
