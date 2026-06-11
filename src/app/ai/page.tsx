import { Page } from "../../components/shell/Page";
import { AiClient } from "./AiClient";

export default function AiPage() {
  return (
    <Page title="AI Assistant" subtitle="Governed, redaction-gated decision support. Drafts only — a human decides.">
      <AiClient />
    </Page>
  );
}
