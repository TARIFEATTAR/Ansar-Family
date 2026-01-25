/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as admin from "../admin.js";
import type * as ansars from "../ansars.js";
import type * as debug_user from "../debug_user.js";
import type * as fix_my_role from "../fix_my_role.js";
import type * as intakes from "../intakes.js";
import type * as organizations from "../organizations.js";
import type * as pairings from "../pairings.js";
import type * as partners from "../partners.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  admin: typeof admin;
  ansars: typeof ansars;
  debug_user: typeof debug_user;
  fix_my_role: typeof fix_my_role;
  intakes: typeof intakes;
  organizations: typeof organizations;
  pairings: typeof pairings;
  partners: typeof partners;
  users: typeof users;
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
