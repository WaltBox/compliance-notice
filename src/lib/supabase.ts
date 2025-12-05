/**
 * Supabase client for storage operations
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials not configured');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function uploadPartnerLogo(file: File, fileName: string) {
  try {
    const { data, error } = await supabase.storage
      .from('partner-logos')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: true,
      });

    if (error) {
      throw error;
    }

    // Get public URL
    const { data: publicData } = supabase.storage
      .from('partner-logos')
      .getPublicUrl(fileName);

    const publicUrl = publicData?.publicUrl;
    
    if (!publicUrl) {
      throw new Error('Failed to generate public URL - bucket may not be set to public');
    }

    console.log('Logo uploaded successfully:', publicUrl);

    return {
      success: true,
      url: publicUrl,
    };
  } catch (error) {
    console.error('Supabase upload error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed',
    };
  }
}

