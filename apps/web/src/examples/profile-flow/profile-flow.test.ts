import { QueryClient } from '@tanstack/react-query';
import { describe, expect, test, vi } from 'vitest';
import { createActor, waitFor } from 'xstate';

import { createProfileFlow } from './profile-flow';
import { profileQueryOptions } from './profile-query';

type ProfileApi = Parameters<typeof profileQueryOptions>[0];
type Profile = Awaited<ReturnType<ProfileApi['saveProfile']>>;
type SaveProfileInput = Parameters<ProfileApi['saveProfile']>[0];

const initialProfile: Profile = {
  id: 'profile-1',
  name: 'Ada',
};

const createProfileApi = (saveProfile: ProfileApi['saveProfile']): ProfileApi => ({
  readProfile: () => Promise.reject(new Error('Profile reads are not used in flow tests.')),
  saveProfile,
});

const createProfileFlowHarness = (api: ProfileApi, profile: Profile = initialProfile) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
  const flow = createProfileFlow({ api, queryClient });
  const actor = createActor(flow.logic, {
    input: {
      initialDraftName: profile.name,
      profileId: profile.id,
    },
  }).start();

  return {
    actor,
    commands: flow.createCommands(actor),
    flow,
    getView: () => flow.select(actor.getSnapshot()),
    queryClient,
    stop: () => {
      actor.stop();
      queryClient.clear();
    },
  };
};

describe('profile flow', () => {
  test('keeps editing when a blank draft is submitted', () => {
    let saveAttempts = 0;
    const api = createProfileApi(({ draftName, profileId }) => {
      saveAttempts += 1;

      return Promise.resolve({ id: profileId, name: draftName });
    });
    const harness = createProfileFlowHarness(api);

    try {
      harness.commands.changeDraft('   ');
      harness.commands.save();

      expect(harness.getView()).toStrictEqual({
        canRetry: false,
        canSave: false,
        draftName: '   ',
        profileId: initialProfile.id,
        status: 'editing',
      });
      expect(saveAttempts).toBe(0);
    } finally {
      harness.stop();
    }
  });

  test('writes a successful save result to the profile query cache', async () => {
    const receivedInputs: SaveProfileInput[] = [];
    const savedProfile: Profile = {
      id: initialProfile.id,
      name: 'Grace',
    };
    const api = createProfileApi((input) => {
      receivedInputs.push(input);

      return Promise.resolve(savedProfile);
    });
    const harness = createProfileFlowHarness(api);

    try {
      harness.commands.changeDraft(savedProfile.name);
      harness.commands.save();

      expect(harness.getView().status).toBe('saving');

      await waitFor(harness.actor, (snapshot) => harness.flow.select(snapshot).status === 'saved');

      expect(harness.getView()).toStrictEqual({
        canRetry: false,
        canSave: false,
        draftName: savedProfile.name,
        profileId: initialProfile.id,
        status: 'saved',
      });
      expect(receivedInputs).toMatchObject([
        {
          draftName: savedProfile.name,
          profileId: initialProfile.id,
        },
      ]);
      expect(receivedInputs[0].signal.aborted).toBe(false);
      expect(
        harness.queryClient.getQueryData(profileQueryOptions(api, initialProfile.id).queryKey),
      ).toStrictEqual(savedProfile);
    } finally {
      harness.stop();
    }
  });

  test('retries a failed save and stores the successful result', async () => {
    const savedProfile: Profile = {
      id: initialProfile.id,
      name: 'Grace',
    };
    const saveProfile = vi
      .fn<ProfileApi['saveProfile']>()
      .mockRejectedValueOnce(new Error('Temporary save failure.'))
      .mockResolvedValue(savedProfile);
    const api = createProfileApi(saveProfile);
    const harness = createProfileFlowHarness(api);

    try {
      harness.commands.changeDraft(savedProfile.name);
      harness.commands.save();

      await waitFor(harness.actor, (snapshot) => harness.flow.select(snapshot).status === 'failed');

      expect(harness.getView()).toStrictEqual({
        canRetry: true,
        canSave: false,
        draftName: savedProfile.name,
        profileId: initialProfile.id,
        status: 'failed',
      });

      harness.commands.retry();

      await waitFor(harness.actor, (snapshot) => harness.flow.select(snapshot).status === 'saved');

      expect(saveProfile).toHaveBeenCalledTimes(2);
      expect(
        harness.queryClient.getQueryData(profileQueryOptions(api, initialProfile.id).queryKey),
      ).toStrictEqual(savedProfile);
    } finally {
      harness.stop();
    }
  });

  test('preserves a local draft when the same profile is opened again', () => {
    const api = createProfileApi(({ draftName, profileId }) =>
      Promise.resolve({ id: profileId, name: draftName }),
    );
    const harness = createProfileFlowHarness(api);

    try {
      harness.commands.changeDraft('Local draft');
      harness.commands.syncProfile({
        initialDraftName: 'Server update',
        profileId: initialProfile.id,
      });

      expect(harness.getView()).toStrictEqual({
        canRetry: false,
        canSave: true,
        draftName: 'Local draft',
        profileId: initialProfile.id,
        status: 'editing',
      });
    } finally {
      harness.stop();
    }
  });

  test('aborts an in-flight save when a different profile is opened', async () => {
    const pendingSave = Promise.withResolvers<Profile>();
    const saveSignals: AbortSignal[] = [];
    const api = createProfileApi((input) => {
      saveSignals.push(input.signal);

      return pendingSave.promise;
    });
    const harness = createProfileFlowHarness(api);

    try {
      harness.commands.changeDraft('Old profile draft');
      harness.commands.save();

      expect(harness.getView().status).toBe('saving');

      harness.commands.syncProfile({
        initialDraftName: 'New profile',
        profileId: 'profile-2',
      });

      expect(saveSignals).toHaveLength(1);
      expect(saveSignals[0].aborted).toBe(true);

      pendingSave.resolve({
        id: initialProfile.id,
        name: 'Old profile draft',
      });

      await new Promise<void>((resolve) => {
        setImmediate(resolve);
      });

      expect(
        harness.queryClient.getQueryData(profileQueryOptions(api, initialProfile.id).queryKey),
      ).toBeUndefined();
      expect(harness.getView()).toStrictEqual({
        canRetry: false,
        canSave: true,
        draftName: 'New profile',
        profileId: 'profile-2',
        status: 'editing',
      });
    } finally {
      harness.stop();
    }
  });
});
