export type RoadHolder = "municipal" | "state" | "private" | "unknown";

export interface ResolveInput {
  category: "road" | "park" | "public_transport" | "rail" | "other";
  municipality?: string;
  roadHolder?: RoadHolder;
}

export interface ResolveResult {
  actorName: string;
  actorType: "municipality" | "region" | "state" | "association" | "unknown";
  nextAction: "deeplink" | "api" | "explain";
  sourceId: string;
  note: string;
}

export function resolveResponsibility(input: ResolveInput): ResolveResult {
  if (input.category === "road") {
    if (input.roadHolder === "state") {
      return {
        actorName: "Trafikverket",
        actorType: "state",
        nextAction: "deeplink",
        sourceId: "nvdb_vaghaallare",
        note: "NVDB anger statlig väghållare."
      };
    }

    if (input.roadHolder === "municipal" && input.municipality === "Göteborg") {
      return {
        actorName: "Göteborgs Stad",
        actorType: "municipality",
        nextAction: "deeplink",
        sourceId: "goteborg_felanmalan",
        note: "Kommunal väg i Göteborg."
      };
    }

    if (input.roadHolder === "private") {
      return {
        actorName: "Enskild väghållare",
        actorType: "association",
        nextAction: "explain",
        sourceId: "nvdb_vaghaallare",
        note: "Identifiera vägförening eller samfällighet."
      };
    }
  }

  if (input.category === "public_transport") {
    return {
      actorName: "Västtrafik",
      actorType: "region",
      nextAction: "deeplink",
      sourceId: "vasttrafik",
      note: "Kollektivtrafik i Västra Götaland."
    };
  }

  return {
    actorName: "Behöver klassificeras",
    actorType: "unknown",
    nextAction: "explain",
    sourceId: "manual_fallback",
    note: "Ingen säker automatisk routning ännu."
  };
}
