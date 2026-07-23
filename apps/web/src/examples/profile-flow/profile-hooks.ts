'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo } from 'react';

import { useMachineFlow } from '@/lib/machine-flow';
import { useDataPrefetch, useDataQuery } from '@/lib/query/query-hooks';

import { createProfileFlow } from './profile-flow';
import { profileQueryOptions } from './profile-query';

type ProfileApi = Parameters<typeof profileQueryOptions>[0];
type Profile = Awaited<ReturnType<ProfileApi['readProfile']>>;
type ProfileFlowStatus = 'editing' | 'failed' | 'saved' | 'saving';

interface UseProfileFlowOptions {
  readonly api: ProfileApi;
  readonly profile: Profile;
}

interface ProfileFlowCommands {
  readonly changeDraft: (draftName: string) => void;
  readonly retry: () => void;
  readonly save: () => void;
}

interface ProfileFlowView {
  readonly canRetry: boolean;
  readonly canSave: boolean;
  readonly draftName: string;
  readonly status: ProfileFlowStatus;
}

interface ProfileFlowResult {
  readonly commands: ProfileFlowCommands;
  readonly view: ProfileFlowView;
}

const useProfileQuery = (api: ProfileApi, profileId: string) =>
  useDataQuery(profileQueryOptions(api, profileId));

const useProfilePrefetch = (api: ProfileApi, profileId: string) => {
  useDataPrefetch(profileQueryOptions(api, profileId));
};

const useProfileFlow = ({ api, profile }: UseProfileFlowOptions): ProfileFlowResult => {
  const queryClient = useQueryClient();
  const flow = useMemo(() => createProfileFlow({ api, queryClient }), [api, queryClient]);
  const machineFlow = useMachineFlow(flow, {
    input: {
      initialDraftName: profile.name,
      profileId: profile.id,
    },
  });
  const isCurrentProfile = machineFlow.view.profileId === profile.id;
  const commands = useMemo<ProfileFlowCommands>(
    () => ({
      changeDraft: (draftName) => {
        if (isCurrentProfile) {
          machineFlow.commands.changeDraft(draftName);
        }
      },
      retry: () => {
        if (isCurrentProfile) {
          machineFlow.commands.retry();
        }
      },
      save: () => {
        if (isCurrentProfile) {
          machineFlow.commands.save();
        }
      },
    }),
    [isCurrentProfile, machineFlow.commands],
  );
  const view = useMemo<ProfileFlowView>(() => {
    if (!isCurrentProfile) {
      return {
        canRetry: false,
        canSave: false,
        draftName: profile.name,
        status: 'editing',
      };
    }

    return {
      canRetry: machineFlow.view.canRetry,
      canSave: machineFlow.view.canSave,
      draftName: machineFlow.view.draftName,
      status: machineFlow.view.status,
    };
  }, [isCurrentProfile, machineFlow.view, profile.name]);

  useEffect(() => {
    machineFlow.commands.syncProfile({
      initialDraftName: profile.name,
      profileId: profile.id,
    });
  }, [machineFlow.commands, profile.id, profile.name]);

  return { commands, view };
};

export { useProfileFlow, useProfilePrefetch, useProfileQuery };
export type {
  ProfileFlowCommands,
  ProfileFlowResult,
  ProfileFlowStatus,
  ProfileFlowView,
  UseProfileFlowOptions,
};
