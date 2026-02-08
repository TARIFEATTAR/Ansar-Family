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
import type * as contacts from "../contacts.js";
import type * as diagnose_email from "../diagnose_email.js";
import type * as intakes from "../intakes.js";
import type * as messages from "../messages.js";
import type * as migrate_emails from "../migrate_emails.js";
import type * as notifications from "../notifications.js";
import type * as organizations from "../organizations.js";
import type * as pairings from "../pairings.js";
import type * as partners from "../partners.js";
import type * as test_workflows from "../test_workflows.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  admin: typeof admin;
  ansars: typeof ansars;
  contacts: typeof contacts;
  diagnose_email: typeof diagnose_email;
  intakes: typeof intakes;
  messages: typeof messages;
  migrate_emails: typeof migrate_emails;
  notifications: typeof notifications;
  organizations: typeof organizations;
  pairings: typeof pairings;
  partners: typeof partners;
  test_workflows: typeof test_workflows;
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
