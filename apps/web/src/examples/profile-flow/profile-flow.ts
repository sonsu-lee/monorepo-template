import type { QueryClient } from '@tanstack/react-query';
import { assertEvent, assign, fromPromise, setup } from 'xstate';

import { defineMachineFlow } from '@/lib/machine-flow';

import { profileQueryOptions } from './profile-query';

type ProfileApi = Parameters<typeof profileQueryOptions>[0];
type Profile = Awaited<ReturnType<ProfileApi['saveProfile']>>;

interface CreateProfileFlowOptions {
  readonly api: ProfileApi;
  readonly queryClient: QueryClient;
}

interface ProfileFlowInput {
  readonly initialDraftName: string;
  readonly profileId: string;
}

interface ProfileFlowContext {
  readonly draftName: string;
  readonly profileId: string;
}

interface ProfileFlowTypes {
  readonly context?: ProfileFlowContext;
  readonly events?: ProfileFlowEvent;
  readonly input?: ProfileFlowInput;
}

type ProfileFlowEvent =
  | {
      readonly draftName: string;
      readonly type: 'draft.changed';
    }
  | {
      readonly initialDraftName: string;
      readonly profileId: string;
      readonly type: 'profile.opened';
    }
  | {
      readonly type: 'save.requested';
    }
  | {
      readonly type: 'save.retried';
    };

interface SaveProfileActorInput {
  readonly draftName: string;
  readonly profileId: string;
}

type ProfileFlowStatus = 'editing' | 'failed' | 'saved' | 'saving';

interface InternalProfileFlowView {
  readonly canRetry: boolean;
  readonly canSave: boolean;
  readonly draftName: string;
  readonly profileId: string;
  readonly status: ProfileFlowStatus;
}

interface InternalProfileFlowCommands {
  readonly changeDraft: (draftName: string) => void;
  readonly retry: () => void;
  readonly save: () => void;
  readonly syncProfile: (input: ProfileFlowInput) => void;
}

const profileFlowTypes: ProfileFlowTypes = {};

const hasDraftName = (draftName: string) => draftName.trim().length > 0;

const compareProfileFlowViews = (
  previous: InternalProfileFlowView,
  next: InternalProfileFlowView,
) =>
  previous.canRetry === next.canRetry &&
  previous.canSave === next.canSave &&
  previous.draftName === next.draftName &&
  previous.profileId === next.profileId &&
  previous.status === next.status;

const createProfileFlow = ({ api, queryClient }: CreateProfileFlowOptions) => {
  const saveProfile = fromPromise<Profile, SaveProfileActorInput>(async ({ input, signal }) => {
    const profile = await api.saveProfile({ ...input, signal });

    if (signal.aborted) {
      return profile;
    }

    const query = profileQueryOptions(api, input.profileId);

    await queryClient.cancelQueries({ exact: true, queryKey: query.queryKey });

    if (signal.aborted) {
      return profile;
    }

    queryClient.setQueryData(query.queryKey, profile);

    return profile;
  });

  const logic = setup({
    actors: {
      saveProfile,
    },
    actions: {
      syncProfile: assign({
        draftName: ({ event }) => {
          assertEvent(event, 'profile.opened');

          return event.initialDraftName;
        },
        profileId: ({ event }) => {
          assertEvent(event, 'profile.opened');

          return event.profileId;
        },
      }),
      updateDraft: assign({
        draftName: ({ event }) => {
          assertEvent(event, 'draft.changed');

          return event.draftName;
        },
      }),
    },
    guards: {
      hasDraftName: ({ context }) => hasDraftName(context.draftName),
      profileChanged: ({ context, event }) => {
        assertEvent(event, 'profile.opened');

        return context.profileId !== event.profileId;
      },
    },
    types: profileFlowTypes,
  }).createMachine({
    context: ({ input }) => ({
      draftName: input.initialDraftName,
      profileId: input.profileId,
    }),
    id: 'profileFlow',
    initial: 'editing',
    on: {
      'profile.opened': {
        actions: 'syncProfile',
        guard: 'profileChanged',
        target: '.editing',
      },
    },
    states: {
      editing: {
        on: {
          'draft.changed': {
            actions: 'updateDraft',
          },
          'save.requested': {
            guard: 'hasDraftName',
            target: 'saving',
          },
        },
      },
      failed: {
        on: {
          'draft.changed': {
            actions: 'updateDraft',
            target: 'editing',
          },
          'save.retried': {
            guard: 'hasDraftName',
            target: 'saving',
          },
        },
      },
      saved: {
        on: {
          'draft.changed': {
            actions: 'updateDraft',
            target: 'editing',
          },
        },
      },
      saving: {
        invoke: {
          input: ({ context }) => ({
            draftName: context.draftName,
            profileId: context.profileId,
          }),
          onDone: {
            target: 'saved',
          },
          onError: {
            target: 'failed',
          },
          src: 'saveProfile',
        },
      },
    },
  });

  return defineMachineFlow({
    compare: compareProfileFlowViews,
    createCommands: (actorRef): InternalProfileFlowCommands => ({
      changeDraft: (draftName) => {
        actorRef.send({ draftName, type: 'draft.changed' });
      },
      retry: () => {
        actorRef.send({ type: 'save.retried' });
      },
      save: () => {
        actorRef.send({ type: 'save.requested' });
      },
      syncProfile: (input) => {
        actorRef.send({ ...input, type: 'profile.opened' });
      },
    }),
    logic,
    select: (snapshot): InternalProfileFlowView => {
      const canSubmit = hasDraftName(snapshot.context.draftName);
      let status: ProfileFlowStatus = 'failed';

      if (snapshot.matches('editing')) {
        status = 'editing';
      } else if (snapshot.matches('saving')) {
        status = 'saving';
      } else if (snapshot.matches('saved')) {
        status = 'saved';
      }

      return {
        canRetry: snapshot.matches('failed') && canSubmit,
        canSave: snapshot.matches('editing') && canSubmit,
        draftName: snapshot.context.draftName,
        profileId: snapshot.context.profileId,
        status,
      };
    },
  });
};

export { createProfileFlow };
