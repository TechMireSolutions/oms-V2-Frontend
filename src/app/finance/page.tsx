import { Page } from "../../components/shell/Page";
import { FinanceClient } from "./FinanceClient";

export default function FinancePage() {
  return (
    <Page title="Finance" subtitle="Double-entry ledger — immutable, balanced, maker-checker controlled.">
      <FinanceClient />
    </Page>
  );
}
