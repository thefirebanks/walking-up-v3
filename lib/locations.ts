import { supabase } from './supabase';

export type UserLocation = {
  id: string;
  user_id: string;
  latitude: number;
  longitude: number;
  location_name?: string;
  updated_at: string;
};

export type LocationShare = {
  id: string;
  sender_id: string;
  receiver_id: string;
  created_at: string;
};

export type SharedLocationView = {
  sender_id: string;
  latitude: number;
  longitude: number;
  location_name: string;
  updated_at: string;
  sender_email?: string;
};

/**
 * Updates the current user's location
 * @param latitude Latitude of the location
 * @param longitude Longitude of the location
 * @param locationName Optional name for the location
 * @returns The updated user location record
 */
export const updateMyLocation = async (
  latitude: number,
  longitude: number,
  locationName?: string
): Promise<UserLocation | null> => {
  try {
    const { data: currentUser } = await supabase.auth.getUser();
    
    if (!currentUser.user) {
      throw new Error('User not authenticated');
    }

    // Check if user already has a location
    const { data: existingLocation } = await supabase
      .from('user_locations')
      .select('*')
      .eq('user_id', currentUser.user.id)
      .maybeSingle();

    // If location exists, update it; otherwise insert new one
    const operation = existingLocation ? 
      supabase
        .from('user_locations')
        .update({
          latitude,
          longitude,
          location_name: locationName || 'Shared Location',
          updated_at: new Date().toISOString()
        })
        .eq('user_id', currentUser.user.id) :
      supabase
        .from('user_locations')
        .insert({
          user_id: currentUser.user.id,
          latitude,
          longitude,
          location_name: locationName || 'Shared Location'
        });

    const { data, error } = await operation.select().single();

    if (error) {
      console.error('Error updating location:', error);
      return null;
    }

    return data as UserLocation;
  } catch (error) {
    console.error('Error in updateMyLocation:', error);
    return null;
  }
};

/**
 * Shares location with a friend
 * @param friendId ID of the friend to share the location with
 * @returns The created share record
 */
export const shareLocationWithFriend = async (
  friendId: string
): Promise<LocationShare | null> => {
  try {
    const { data: currentUser } = await supabase.auth.getUser();
    
    if (!currentUser.user) {
      throw new Error('User not authenticated');
    }

    // Check if user has a location
    const { data: myLocation } = await supabase
      .from('user_locations')
      .select('*')
      .eq('user_id', currentUser.user.id)
      .maybeSingle();

    if (!myLocation) {
      throw new Error('You need to set your location before sharing');
    }

    // Check if share already exists
    const { data: existingShare } = await supabase
      .from('location_shares')
      .select('*')
      .eq('sender_id', currentUser.user.id)
      .eq('receiver_id', friendId)
      .maybeSingle();

    // If share doesn't exist, create it
    if (!existingShare) {
      const { data, error } = await supabase
        .from('location_shares')
        .insert({
          sender_id: currentUser.user.id,
          receiver_id: friendId
        })
        .select()
        .single();

      if (error) {
        console.error('Error sharing location:', error);
        return null;
      }

      return data as LocationShare;
    }

    return existingShare as LocationShare;
  } catch (error) {
    console.error('Error in shareLocationWithFriend:', error);
    return null;
  }
};

/**
 * Gets all locations shared with the current user
 * @returns Array of shared locations with sender information
 */
export const getLocationsSharedWithMe = async (): Promise<SharedLocationView[]> => {
  try {
    const { data: currentUser } = await supabase.auth.getUser();
    
    if (!currentUser.user) {
      throw new Error('User not authenticated');
    }

    // Step 1: Get all location shares where the current user is the receiver
    const { data: shares, error: sharesError } = await supabase
      .from('location_shares')
      .select('sender_id')
      .eq('receiver_id', currentUser.user.id);

    if (sharesError) {
      console.error('Error getting location shares:', sharesError);
      return [];
    }

    if (!shares || shares.length === 0) {
      return [];
    }

    const senderIds = shares.map(share => share.sender_id);
    
    // Step 2: Get all user locations for these senders
    const { data: locations, error: locationsError } = await supabase
      .from('user_locations')
      .select('*')
      .in('user_id', senderIds);
    
    if (locationsError) {
      console.error('Error getting locations:', locationsError);
      return [];
    }
    
    if (!locations || locations.length === 0) {
      return [];
    }
    
    // Step 3: Get user profiles for these senders
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, email')
      .in('id', senderIds);
    
    if (profilesError) {
      console.error('Error getting profiles:', profilesError);
      return [];
    }
    
    // Step 4: Combine the data
    const result: SharedLocationView[] = [];
    for (const location of locations) {
      const profile = profiles.find(p => p.id === location.user_id);
      result.push({
        sender_id: location.user_id,
        latitude: location.latitude,
        longitude: location.longitude,
        location_name: location.location_name || 'Shared Location',
        updated_at: location.updated_at,
        sender_email: profile?.email || 'Unknown'
      });
    }
    
    return result;
  } catch (error) {
    console.error('Error in getLocationsSharedWithMe:', error);
    return [];
  }
};

/**
 * Stops sharing location with a friend
 * @param friendId ID of the friend to stop sharing with
 * @returns true if successful, false otherwise
 */
export const stopSharingWithFriend = async (friendId: string): Promise<boolean> => {
  try {
    const { data: currentUser } = await supabase.auth.getUser();
    
    if (!currentUser.user) {
      throw new Error('User not authenticated');
    }

    const { error } = await supabase
      .from('location_shares')
      .delete()
      .eq('sender_id', currentUser.user.id)
      .eq('receiver_id', friendId);

    if (error) {
      console.error('Error stopping location sharing:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in stopSharingWithFriend:', error);
    return false;
  }
};

/**
 * Gets list of friends the user is sharing location with
 * @returns Array of friend IDs
 */
export const getFriendsImSharingWith = async (): Promise<string[]> => {
  try {
    const { data: currentUser } = await supabase.auth.getUser();
    
    if (!currentUser.user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('location_shares')
      .select('receiver_id')
      .eq('sender_id', currentUser.user.id);

    if (error) {
      console.error('Error getting sharing list:', error);
      return [];
    }

    return data.map(share => share.receiver_id);
  } catch (error) {
    console.error('Error in getFriendsImSharingWith:', error);
    return [];
  }
};

/**
 * Gets the current user's saved location from the database
 * @returns The user's location or null if not found
 */
export const getSavedUserLocation = async (): Promise<{latitude: number, longitude: number, location_name?: string} | null> => {
  try {
    const { data: currentUser } = await supabase.auth.getUser();
    
    if (!currentUser.user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('user_locations')
      .select('latitude, longitude, location_name')
      .eq('user_id', currentUser.user.id)
      .maybeSingle();

    if (error) {
      console.error('Error getting user location:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in getSavedUserLocation:', error);
    return null;
  }
};