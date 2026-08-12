# Frontend state and data flow

Use these conventions for React state, XState machines, TanStack Query data,
asynchronous actors, and prefetching under `apps/web`.

The boundary is ownership, not whether an operation is asynchronous.

## Ownership

| Concern | Owner | Notes |
| --- | --- | --- |
| Server entities, cache, freshness, pending and error state, refetching | TanStack Query | Components read this state from query results. |
| Local UI state, workflow transitions, and editable drafts | XState | The machine models what the user can do next. |
| Values derived for rendering | Selector or component | Derive them from their source instead of storing another copy. |
| Outcome of asynchronous work started and branched on by a machine | XState actor | Model success and failure with actor `onDone` and `onError` transitions. |

Initializing an editable draft from loaded server data is local initialization.
It does not make the draft a live copy of the cache. Never copy `query.data`,
query status, or query errors into machine context, and never continuously sync
every same-resource refetch into a draft.

A resource identity change is different. The profile example has one narrow
`profile.opened` event for that boundary. Its guard ignores same-ID refetches,
so a background update does not overwrite an in-progress draft.

## Define each query once

Create a native TanStack Query `queryOptions` factory for each resource. It is
the canonical source for the query key, query function, and inferred result
type:

```ts
const profileQueryOptions = (api: ProfileApi, profileId: string) =>
  queryOptions({
    queryKey: ['profiles', 'detail', profileId] as const,
    queryFn: ({ signal }) => api.readProfile({ profileId, signal }),
  });
```

Reuse that options object with hooks and `QueryClient` methods. Do not rebuild
keys or query functions at each call site.

`useDataQuery` and `useDataPrefetch` in
`apps/web/src/lib/query/query-hooks.ts` are exact aliases of TanStack Query's
`useQuery` and `usePrefetchQuery`. They preserve the upstream API and types.
They are naming boundaries, not a second cache or a generic query abstraction.

## Choose the API by call timing

| Situation | Use | Behavior |
| --- | --- | --- |
| Rendering depends on server data | `useDataQuery(options)` | TanStack Query owns data, pending, error, freshness, and refetching. |
| Render-time warmup before a descendant needs an absent query | `useDataPrefetch(options)` | Call it unconditionally at the top level of a component. It returns `void`; it is not a refresh or workflow primitive. |
| An event should warm the cache for likely future use | `queryClient.prefetchQuery(options)` | Returns `Promise<void>` and does not surface a workflow error branch. |
| A machine transition depends on the loaded value or failure | `fromPromise` plus `queryClient.fetchQuery(options)` | The promise result drives `onDone`; a rejection drives `onError`. |

Hooks always follow the Rules of Hooks. Do not call `useDataPrefetch` inside an
event handler, command, effect callback, condition, or machine action. Use
`queryClient.prefetchQuery` for event-time cache warmup.

Do not use prefetch as an implicit refresh mechanism. If the current screen
needs fresh data, express that through its query configuration, invalidation,
or an explicit refetch. If failure changes the workflow, use `fetchQuery`
inside a promise actor instead of `prefetchQuery`.

## Expose machine flows as views and commands

`defineMachineFlow` describes four parts:

- `logic`: the XState actor logic.
- `select`: the public render view derived from a snapshot.
- `compare`: an optional equality function that avoids unnecessary renders.
- `createCommands`: intention-revealing functions that translate component
  actions into typed events.

`useMachineFlow` owns the React actor lifecycle, accepts typed actor options
including required machine input, and returns only `{ view, commands }`.
Components should render from `view` and invoke `commands`; do not expose a raw
`actorRef` or call `send` from components.

Keep dependency-free flows at module scope. When a flow closes over a
`QueryClient` or API adapter, build it with a factory and memoize it:

```ts
const queryClient = useQueryClient();
const flow = useMemo(
  () => createProfileFlow({ api, queryClient }),
  [api, queryClient],
);
```

### Keep injected dependencies stable

The `ProfileApi` adapter must be module-level or supplied by a referentially
stable provider or context. Never create it inline at the `useProfileFlow`
call. An API identity change changes the machine logic and actor lifecycle.
Flow identity also affects command stability.

## Use `fromPromise` when the machine owns the branch

Use an invoked `fromPromise` actor when a transition determines when work
starts and the machine must represent success, failure, cancellation, retry,
or the set of legal actions while work is pending.

The profile example's `saving` and `failed` states describe its write
workflow. They are not copies of the profile query's pending or error state.

Inject `QueryClient` and API adapters through the flow factory closure. Never
store a `QueryClient` in machine context. Machine context should contain
workflow data such as the resource ID and draft fields.

Forward the cancellation signal owned by the layer performing the request:

- A query function forwards TanStack Query's `signal` to the read API. The
  profile `queryOptions` factory does this.
- A direct API call in `fromPromise` forwards the actor's `signal`. The profile
  save actor does this. The API adapter must honor that signal to cancel its
  underlying transport.
- A `fromPromise` actor that calls `fetchQuery` reuses the canonical
  `queryOptions`; its query function continues to receive the TanStack Query
  signal.

Do not automatically translate an actor abort into
`queryClient.cancelQueries`. A cached query can have other observers, so
cancelling it may interrupt work owned by another component. XState will
discard the stopped promise actor's late transition, while TanStack Query can
finish managing the shared cache.

The profile save actor has a separate consistency requirement after a
successful write. It:

1. Sends the `fromPromise` signal to `api.saveProfile`.
2. Checks for an aborted actor before changing the cache.
3. Calls `cancelQueries({ exact: true, queryKey })`.
4. Checks for an abort again after cancellation.
5. Writes the successful server response with `setQueryData`.

That exact cancellation is not automatic actor-abort handling. It prevents an
older active read for the same profile from finishing later and overwriting
the successful save.

## Compose a query-owning parent with a loaded child

Let a parent own the query states and render a child only after data is
available. The child can then initialize its workflow from a loaded entity
without conditionally calling hooks:

```tsx
function ProfileScreen({
  api,
  profileId,
}: {
  api: ProfileApi;
  profileId: string;
}) {
  const query = useProfileQuery(api, profileId);

  if (query.isPending) {
    return <ProfilePending />;
  }

  if (query.isError) {
    return <ProfileError error={query.error} />;
  }

  return (
    <ProfileEditor
      key={query.data.id}
      api={api}
      profile={query.data}
    />
  );
}

function ProfileEditor({
  api,
  profile,
}: {
  api: ProfileApi;
  profile: Profile;
}) {
  const { commands, view } = useProfileFlow({ api, profile });

  // Render from view and bind UI actions to commands.
}
```

Use `key={query.data.id}` when a new resource identity should start an atomic
new workflow. Never key the child by the data object or `dataUpdatedAt`; those
change during same-ID background refetches and would discard a local draft.

The current `useProfileFlow` also protects the brief identity mismatch before
its synchronization effect runs. During a mismatch it exposes a safe view for
the new profile with `canSave` and `canRetry` disabled, and its change, save,
and retry commands are no-ops. The internal `profile.opened` event then
synchronizes a different ID and returns the workflow to editing.
`syncProfile` and the machine's `profileId` are implementation details and are
not part of the public hook result.

For the same ID, `profile.opened` is ignored. Background refetches therefore
preserve the draft. If a feature needs to replace or merge a draft with newer
server data, add an explicit reset or rebase event and define that product
behavior in the machine.

## Example file map

- `apps/web/src/lib/query/query-client.ts` creates the server and browser query
  clients.
- `apps/web/src/lib/query/query-hooks.ts` exposes the two exact query hook
  aliases.
- `apps/web/src/lib/machine-flow/define-machine-flow.ts` defines the flow
  contract.
- `apps/web/src/lib/machine-flow/use-machine-flow.ts` binds a flow to React.
- `apps/web/src/examples/profile-flow/profile-query.ts` defines the resource
  API and canonical query options.
- `apps/web/src/examples/profile-flow/profile-flow.ts` defines the draft and
  save workflow.
- `apps/web/src/examples/profile-flow/profile-hooks.ts` composes queries,
  prefetching, and the machine flow.

The profile files are a compile-checked architecture example. They are not a
live application route.

## Avoid these patterns

- Copying `query.data`, `isPending`, `isError`, or query errors into machine
  context.
- Replacing a draft on every same-ID refetch.
- Fetching cacheable server reads directly when `fetchQuery` should coordinate
  the shared cache.
- Using render-time prefetch for event-time work, forced refreshes, or workflow
  error handling.
- Calling hooks conditionally or from machine actions and commands.
- Storing `QueryClient`, API clients, or other service objects in machine
  context.
- Cancelling a shared query merely because a promise actor stopped.
- Exposing raw actor references or internal synchronization commands to
  components.
- Recreating a flow or API adapter on every render.
- Keying a workflow child by a query data object or update timestamp.

## Verify changes

Run the full repository checks from the workspace root:

```bash
pnpm format:check
pnpm lint
pnpm test
pnpm build
```
