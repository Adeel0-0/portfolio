/**
 * The GitHub contribution graph's data contract.
 *
 * This type used to be declared in app/api/contributions/route.ts and imported
 * from there by two client components — which pointed the dependency graph at
 * a route handler. A route is a delivery mechanism; renaming or moving it
 * should not break a component. The shared shape belongs in a layer both sides
 * can depend on, which is this one.
 *
 * The parser and the fetch land here too, in a later phase. For now this is
 * the type alone, so the move stays reviewable on its own.
 */

export type ContributionDay = {
  date: string;
  count: number;
  level?: 0 | 1 | 2 | 3 | 4;
};
