/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as acces from "../acces.js";
import type * as controles from "../controles.js";
import type * as crons from "../crons.js";
import type * as decembre from "../decembre.js";
import type * as instagram from "../instagram.js";
import type * as miniAudits from "../miniAudits.js";
import type * as mois from "../mois.js";
import type * as publications from "../publications.js";
import type * as reelsEssai from "../reelsEssai.js";
import type * as rotation from "../rotation.js";
import type * as scripts from "../scripts.js";
import type * as scriptsDecembre from "../scriptsDecembre.js";
import type * as seed from "../seed.js";
import type * as stories from "../stories.js";
import type * as suivi from "../suivi.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  acces: typeof acces;
  controles: typeof controles;
  crons: typeof crons;
  decembre: typeof decembre;
  instagram: typeof instagram;
  miniAudits: typeof miniAudits;
  mois: typeof mois;
  publications: typeof publications;
  reelsEssai: typeof reelsEssai;
  rotation: typeof rotation;
  scripts: typeof scripts;
  scriptsDecembre: typeof scriptsDecembre;
  seed: typeof seed;
  stories: typeof stories;
  suivi: typeof suivi;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
