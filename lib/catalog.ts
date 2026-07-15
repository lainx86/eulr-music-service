import catalogData from "@/data/catalog.json";
import stationData from "@/data/station.json";
import {
  CatalogSchema,
  StationSchema,
  type Catalog,
  type Station,
} from "@/lib/types";

let cachedCatalog: Catalog | undefined;
let cachedStation: Station | undefined;

export function getCatalog(): Catalog {
  cachedCatalog ??= CatalogSchema.parse(catalogData);
  return cachedCatalog;
}

export function getStation(): Station {
  cachedStation ??= StationSchema.parse(stationData);
  return cachedStation;
}
