import { api } from "@/lib/api";

export type DataEnvironmentName = "local" | "supabase";

export type DataEnvironment = {
  environment: DataEnvironmentName;
  connection_status: "available" | "unavailable";
  schema_compatible: boolean;
  can_switch_data_environment: boolean;
};

export type DataEnvironmentSwitchResult = {
  environment: DataEnvironmentName;
  reauthentication_required: true;
};

export function fetchDataEnvironment(): Promise<DataEnvironment> {
  return api("/api/data_environment", { cache: "no-store" });
}

export function switchDataEnvironment(environment: DataEnvironmentName): Promise<DataEnvironmentSwitchResult> {
  return api("/api/data_environment/switch", {
    method: "POST",
    headers: { "X-Finch-Data-Environment-Switch": "confirmed" },
    body: JSON.stringify({ environment }),
    cache: "no-store",
  });
}
