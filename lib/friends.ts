import { supabase } from '@/lib/supabase';

// Types
export type Profile = {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
};

export type Friend = {
  friend_id: string;
  friend_name: string;
  friend_avatar: string | null;
};

export type FriendRequest = {
  requestor_id: string;
  requestor_name: string;
  requestor_avatar: string | null;
  request_date: string;
};

export type OutgoingFriendRequest = {
  recipient_id: string;
  recipient_name: string;
  recipient_avatar: string | null;
  request_date: string;
};

export type FriendshipStatus = 'pending' | 'accepted' | 'rejected';

// Function to get current user ID
const getCurrentUserId = async (): Promise<string | null> => {
  const { data } = await supabase.auth.getUser();
  return data.user?.id || null;
};

// Function to search user by email
export const findUserByEmail = async (email: string): Promise<Profile | null> => {
  // Trim any whitespace and convert to lowercase for more reliable comparison
  const normalizedEmail = email.trim().toLowerCase();
  
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .ilike('email', normalizedEmail);

  if (error) {
    console.error('Error searching for user:', error);
    return null;
  }
  
  // No user found with this email
  if (!data || data.length === 0) {
    return null;
  }
  
  // Return the first matching user
  return data[0] as Profile;
};

// Function to send a friend request
export const sendFriendRequest = async (recipientId: string): Promise<boolean> => {
  const userId = await getCurrentUserId();
  if (!userId) return false;

  // Prevent sending request to yourself
  if (userId === recipientId) {
    console.error('Cannot send friend request to yourself');
    return false;
  }

  const { error } = await supabase
    .from('friendships')
    .insert({
      requestor_id: userId,
      recipient_id: recipientId,
      status: 'pending'
    });

  if (error) {
    console.error('Error sending friend request:', error);
    return false;
  }

  return true;
};

// Function to get all pending friend requests for the current user
export const getPendingFriendRequests = async (): Promise<FriendRequest[]> => {
  const userId = await getCurrentUserId();
  if (!userId) return [];

  const { data, error } = await supabase
    .rpc('get_pending_friend_requests', {
      user_id: userId
    });

  if (error) {
    console.error('Error getting pending friend requests:', error);
    return [];
  }

  return data as FriendRequest[];
};

// Function to get all outgoing friend requests sent by the current user
export const getOutgoingFriendRequests = async (): Promise<OutgoingFriendRequest[]> => {
  const userId = await getCurrentUserId();
  if (!userId) return [];

  // First, get all pending outgoing friend requests
  const { data: friendships, error: friendshipsError } = await supabase
    .from('friendships')
    .select('recipient_id, created_at')
    .eq('requestor_id', userId)
    .eq('status', 'pending');

  if (friendshipsError || !friendships.length) {
    if (friendshipsError) {
      console.error('Error getting outgoing friend requests:', friendshipsError);
    }
    return [];
  }

  // Get profile info for each recipient
  const outgoingRequests: OutgoingFriendRequest[] = [];
  
  for (const friendship of friendships) {
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('full_name, avatar_url')
      .eq('id', friendship.recipient_id)
      .single();
      
    if (!profileError && profileData) {
      outgoingRequests.push({
        recipient_id: friendship.recipient_id,
        recipient_name: profileData.full_name || 'Unknown',
        recipient_avatar: profileData.avatar_url,
        request_date: friendship.created_at
      });
    } else {
      // Add request with just the basic info if profile can't be fetched
      outgoingRequests.push({
        recipient_id: friendship.recipient_id,
        recipient_name: 'Unknown User',
        recipient_avatar: null,
        request_date: friendship.created_at
      });
    }
  }
  
  return outgoingRequests;
};

// Function to cancel an outgoing friend request
export const cancelFriendRequest = async (recipientId: string): Promise<boolean> => {
  const userId = await getCurrentUserId();
  if (!userId) return false;

  const { error } = await supabase
    .from('friendships')
    .delete()
    .match({
      requestor_id: userId,
      recipient_id: recipientId,
      status: 'pending'
    });

  if (error) {
    console.error('Error canceling friend request:', error);
    return false;
  }

  return true;
};

// Function to get all friends of the current user
export const getFriends = async (): Promise<Friend[]> => {
  const userId = await getCurrentUserId();
  if (!userId) return [];

  const { data, error } = await supabase
    .rpc('get_friends', {
      user_id: userId
    });

  if (error) {
    console.error('Error getting friends:', error);
    return [];
  }

  return data as Friend[];
};

// Function to get a specific friend's details by their ID
export const getFriendById = async (friendId: string): Promise<Friend | null> => {
  const userId = await getCurrentUserId();
  if (!userId) return null;

  const { data, error } = await supabase
    .rpc('get_friends', {
      user_id: userId
    });

  if (error) {
    console.error('Error getting friends:', error);
    return null;
  }

  const friend = data.find((f: Friend) => f.friend_id === friendId);
  return friend || null;
};

// Function to update friendship status (accept or reject)
export const updateFriendshipStatus = async (
  requestorId: string,
  status: FriendshipStatus
): Promise<boolean> => {
  const userId = await getCurrentUserId();
  if (!userId) return false;

  const { error } = await supabase
    .from('friendships')
    .update({ status, updated_at: new Date().toISOString() })
    .match({
      requestor_id: requestorId,
      recipient_id: userId
    });

  if (error) {
    console.error('Error updating friendship status:', error);
    return false;
  }

  return true;
};

// Function to check if a friendship exists between two users
export const checkFriendshipStatus = async (otherUserId: string): Promise<FriendshipStatus | null> => {
  const userId = await getCurrentUserId();
  if (!userId) return null;
  
  const { data, error } = await supabase
    .from('friendships')
    .select('status')
    .or(`and(requestor_id.eq.${userId},recipient_id.eq.${otherUserId}),and(requestor_id.eq.${otherUserId},recipient_id.eq.${userId})`)
    .maybeSingle();

  if (error && error.code !== 'PGRST116') {
    console.error('Error checking friendship status:', error);
    return null;
  }

  return data?.status as FriendshipStatus || null;
}; 