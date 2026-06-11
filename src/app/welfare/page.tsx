import { Page } from "../../components/shell/Page";
import { WelfareClient } from "./WelfareClient";

export default function WelfarePage() {
  return (
    <Page title="Welfare" subtitle="Review requests through the maker-checker decision flow.">
      <WelfareClient />
    </Page>
  );
}
