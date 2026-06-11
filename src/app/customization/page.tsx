import { Page } from "../../components/shell/Page";
import { BuilderClient } from "./BuilderClient";

export default function CustomizationPage() {
  return (
    <Page title="Builder" subtitle="Metadata-driven forms — rendered from a FormDefinition, validated client + server.">
      <BuilderClient />
    </Page>
  );
}
