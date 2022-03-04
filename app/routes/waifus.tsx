import { MetaFunction } from "remix";
import PageTitle from "~/components/PageTitle";

export const meta: MetaFunction = () => ({
  title: "Waifus - Waifu Trader",
});

export default function Waifus() {
  return (
    <div>
      <PageTitle>Waifus</PageTitle>
    </div>
  );
}
