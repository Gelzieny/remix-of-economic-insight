import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface Profile {
  display_name: string | null;
  avatar_url: string | null;
}

export function useProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile>({ display_name: null, avatar_url: null });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchProfile = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from('profiles')
      .select('display_name, avatar_url')
      .eq('user_id', user.id)
      .maybeSingle();

    if (data) {
      setProfile({ display_name: data.display_name, avatar_url: data.avatar_url });
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const updateDisplayName = async (name: string) => {
    if (!user) return;
    setSaving(true);

    const { data: existing } = await supabase
      .from('profiles')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle();

    let error;
    if (existing) {
      ({ error } = await supabase
        .from('profiles')
        .update({ display_name: name })
        .eq('user_id', user.id));
    } else {
      ({ error } = await supabase
        .from('profiles')
        .insert({ user_id: user.id, display_name: name }));
    }

    if (error) {
      toast.error('Erro ao salvar nome.');
    } else {
      setProfile((p) => ({ ...p, display_name: name }));
      toast.success('Nome atualizado com sucesso!');
    }
    setSaving(false);
  };

  const uploadAvatar = async (file: File) => {
    if (!user) return;
    setSaving(true);

    const fileExt = file.name.split('.').pop();
    const filePath = `${user.id}/avatar.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      toast.error('Erro ao enviar foto.');
      setSaving(false);
      return;
    }

    const { data: urlData } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath);

    const avatarUrl = `${urlData.publicUrl}?t=${Date.now()}`;

    const { data: existing } = await supabase
      .from('profiles')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle();

    let error;
    if (existing) {
      ({ error } = await supabase
        .from('profiles')
        .update({ avatar_url: avatarUrl })
        .eq('user_id', user.id));
    } else {
      ({ error } = await supabase
        .from('profiles')
        .insert({ user_id: user.id, avatar_url: avatarUrl }));
    }

    if (error) {
      toast.error('Erro ao salvar foto.');
    } else {
      setProfile((p) => ({ ...p, avatar_url: avatarUrl }));
      toast.success('Foto atualizada com sucesso!');
    }
    setSaving(false);
  };

  const changePassword = async (newPassword: string) => {
    setSaving(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
      toast.error(error.message || 'Erro ao alterar senha.');
    } else {
      toast.success('Senha alterada com sucesso!');
    }
    setSaving(false);
    return !error;
  };

  return { profile, loading, saving, updateDisplayName, uploadAvatar, changePassword };
}
