import { Page } from "../../components/shell/Page";
import { AdmissionsClient } from "./AdmissionsClient";

export default function AdmissionsPage() {
  return (
    <Page title="Admissions" subtitle="Submit and track student applications.">
      <AdmissionsClient />
    </Page>
  );
}
