import * as services from "../../services.json";

export default defineEventHandler((event) => {
  return services.features;
});
