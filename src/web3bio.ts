type ProfileData = {
  address: string;
  identity: string;
  platform: string;
  displayName: string;
  avatar: string;
  description: string | null;
  social?: {
    uid: string | null;
    follower: number;
    following: number;
  };
};

export async function fetchWeb3BioProfile(address: string): Promise<ProfileData[]> {
  try {
    const req = await fetch(`https://api.web3.bio/profile/${address}`);
    const res = (await req.json()) as unknown as ProfileData[]
    return res;
  } catch (error) {
    console.error(`Error fetching profile for ${address}:`, error);
    return [];
  }
}

export function extractProfileInfo(profiles: ProfileData[]) {
  let farcasterProfile = profiles.find(p => p.platform === 'farcaster');
  let ensProfile = profiles.find(p => p.platform === 'ens');
  let lensProfile = profiles.find(p => p.platform === 'lens');

  return {
    farcasterName: farcasterProfile?.identity || null,
    farcasterDisplayName: farcasterProfile?.displayName || null,
    farcasterAvatar: farcasterProfile?.avatar || null,
    farcasterDescription: farcasterProfile?.description || null,
    farcasterFollowers: farcasterProfile?.social?.follower || null,
    ensName: ensProfile?.identity || null,
    lensHandle: lensProfile?.identity || null,
  };
}
