import { queryOptions } from '@tanstack/react-query';

interface Profile {
  readonly id: string;
  readonly name: string;
}

interface ReadProfileInput {
  readonly profileId: string;
  readonly signal: AbortSignal;
}

interface SaveProfileInput {
  readonly draftName: string;
  readonly profileId: string;
  readonly signal: AbortSignal;
}

interface ProfileApi {
  readonly readProfile: (input: ReadProfileInput) => Promise<Profile>;
  readonly saveProfile: (input: SaveProfileInput) => Promise<Profile>;
}

const profileQueryOptions = (api: ProfileApi, profileId: string) =>
  queryOptions({
    queryKey: ['profiles', 'detail', profileId] as const,
    queryFn: ({ signal }) => api.readProfile({ profileId, signal }),
  });

export { profileQueryOptions };
export type { Profile, ProfileApi, ReadProfileInput, SaveProfileInput };
