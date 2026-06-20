import type { ServiceContainer } from "@/modules/accounting/application/contracts";
import {
  createHttpServiceContainer,
  resolveApiBaseUrl
} from "@/lib/services/http-service-container";
// import { createMockAccountingServices } from "@/modules/accounting/mocks/mock-services-v2";
// import { clearAccountingStore } from "@/shared/storage/accounting-store-persistence";

let container: ServiceContainer | null = null;

export function getServiceContainer(): ServiceContainer {
  if (!container) {
    const apiBaseUrl = resolveApiBaseUrl();
    if (!apiBaseUrl) {
      throw new Error(
        "NEXT_PUBLIC_API_URL is not set. Add it to ui/.env (see ui/.env.example)."
      );
    }
    container = createHttpServiceContainer(apiBaseUrl);
    // container = createMockAccountingServices(); // disabled: in-browser mocks + localStorage
  }
  return container;
}

export function resetServiceContainer(): void {
  // clearAccountingStore(); // disabled: localStorage
  container = null;
}
