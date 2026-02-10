import { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { LogOut, Mail, Calendar, Settings, ChevronRight, FileText, Camera, KeyRound, Pencil, Check, X } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useProfile } from '@/hooks/useProfile';
import { toast } from 'sonner';

export default function Profile() {
  const { user, signOut } = useAuth();
  const { profile, loading: profileLoading, saving, updateDisplayName, uploadAvatar, changePassword } = useProfile();

  // Report subscription
  const [reportEnabled, setReportEnabled] = useState(false);
  const [loadingReport, setLoadingReport] = useState(true);

  // Inline name editing
  const [editingName, setEditingName] = useState(false);
  const [nameValue, setNameValue] = useState('');

  // Password change
  const [showPassword, setShowPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync name value when profile loads
  useEffect(() => {
    if (profile.display_name !== null) {
      setNameValue(profile.display_name);
    } else if (user?.email) {
      setNameValue(user.email.split('@')[0]);
    }
  }, [profile.display_name, user?.email]);

  const fetchSubscription = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from('subscribers')
      .select('active')
      .eq('user_id', user.id)
      .maybeSingle();
    setReportEnabled(data?.active ?? false);
    setLoadingReport(false);
  }, [user]);

  useEffect(() => { fetchSubscription(); }, [fetchSubscription]);

  const toggleReport = async (checked: boolean) => {
    if (!user) return;
    setReportEnabled(checked);
    const { data: existing } = await supabase
      .from('subscribers')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle();

    let error;
    if (existing) {
      ({ error } = await supabase.from('subscribers').update({ active: checked }).eq('user_id', user.id));
    } else {
      ({ error } = await supabase.from('subscribers').insert({
        user_id: user.id,
        email: user.email!,
        name: user.email!.split('@')[0],
        active: checked,
      }));
    }
    if (error) {
      setReportEnabled(!checked);
      toast.error('Erro ao atualizar preferência de relatório.');
    } else {
      toast.success(checked ? 'Relatório Econômico ativado!' : 'Relatório Econômico desativado.');
    }
  };

  const handleSaveName = async () => {
    if (!nameValue.trim()) return;
    await updateDisplayName(nameValue.trim());
    setEditingName(false);
  };

  const handleAvatarClick = () => fileInputRef.current?.click();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error('A imagem deve ter no máximo 2MB.');
      return;
    }
    uploadAvatar(file);
  };

  const handleChangePassword = async () => {
    if (newPassword.length < 6) {
      toast.error('A senha deve ter pelo menos 6 caracteres.');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('As senhas não coincidem.');
      return;
    }
    const success = await changePassword(newPassword);
    if (success) {
      setNewPassword('');
      setConfirmPassword('');
      setShowPassword(false);
    }
  };

  const displayName = profile.display_name || user?.email?.split('@')[0] || 'Usuário';
  const userInitials = displayName.slice(0, 2).toUpperCase();
  const joinedDate = user?.created_at
    ? new Date(user.created_at).toLocaleDateString('pt-BR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : 'Data não disponível';

  return (
    <MainLayout>
      <div className="space-y-6 sm:mx-auto sm:max-w-2xl">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <h1 className="text-2xl font-bold text-foreground">Meu Perfil</h1>
          <p className="text-sm text-muted-foreground">Gerencie suas informações pessoais e configurações</p>
        </motion.div>

        {/* Profile Card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}>
          <Card className="border-border/50 bg-card">
            <CardContent className="p-6">
              <div className="flex flex-col items-center gap-6 sm:flex-row">
                {/* Avatar with upload */}
                <div className="relative group cursor-pointer" onClick={handleAvatarClick}>
                  <Avatar className="h-24 w-24 border-4 border-primary/20">
                    {profile.avatar_url ? (
                      <AvatarImage src={profile.avatar_url} alt="Avatar" />
                    ) : null}
                    <AvatarFallback className="bg-primary/20 text-primary text-2xl">
                      {userInitials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera className="h-6 w-6 text-white" />
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </div>

                {/* Name + email */}
                <div className="flex-1 text-center sm:text-left">
                  {editingName ? (
                    <div className="flex items-center gap-2">
                      <Input
                        value={nameValue}
                        onChange={(e) => setNameValue(e.target.value)}
                        className="h-9 max-w-[200px]"
                        autoFocus
                        onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
                      />
                      <Button size="icon" variant="ghost" className="h-8 w-8" onClick={handleSaveName} disabled={saving}>
                        <Check className="h-4 w-4 text-primary" />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setEditingName(false)}>
                        <X className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2 sm:justify-start">
                      <h2 className="text-xl font-semibold text-foreground">{displayName}</h2>
                      <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setEditingName(true)}>
                        <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                      </Button>
                    </div>
                  )}
                  <p className="text-sm text-muted-foreground mt-1">{user?.email}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Account Info */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.2 }}>
          <Card className="border-border/50 bg-card">
            <CardHeader>
              <CardTitle className="text-base font-semibold">Informações da Conta</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground">E-mail</p>
                  <p className="text-sm font-medium text-foreground">{user?.email}</p>
                </div>
              </div>

              <Separator className="bg-border/50" />

              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground">Membro desde</p>
                  <p className="text-sm font-medium text-foreground">{joinedDate}</p>
                </div>
              </div>

              <Separator className="bg-border/50" />

              {/* Password change */}
              <div>
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                    <KeyRound className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground">Senha</p>
                    <p className="text-sm font-medium text-foreground">••••••••</p>
                  </div>
                  <Button variant="ghost" size="sm" className="gap-1 text-primary" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? 'Cancelar' : 'Alterar'}
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>

                {showPassword && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-4 space-y-3 pl-14"
                  >
                    <div>
                      <Label htmlFor="new-password" className="text-xs text-muted-foreground">Nova senha</Label>
                      <Input
                        id="new-password"
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Mínimo 6 caracteres"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="confirm-password" className="text-xs text-muted-foreground">Confirmar senha</Label>
                      <Input
                        id="confirm-password"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Repita a senha"
                        className="mt-1"
                      />
                    </div>
                    <Button size="sm" onClick={handleChangePassword} disabled={saving}>
                      Salvar nova senha
                    </Button>
                  </motion.div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Preferences */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.3 }}>
          <Card className="border-border/50 bg-card">
            <CardHeader>
              <CardTitle className="text-base font-semibold">Preferências</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <Label htmlFor="report-toggle" className="text-sm font-medium text-foreground cursor-pointer">
                      Relatório Econômico
                    </Label>
                    <p className="text-xs text-muted-foreground">Receber relatório diário por e-mail</p>
                  </div>
                </div>
                <Switch
                  id="report-toggle"
                  checked={reportEnabled}
                  onCheckedChange={toggleReport}
                  disabled={loadingReport}
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Logout */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.4 }}>
          <Button
            variant="outline"
            className="w-full border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive"
            onClick={signOut}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sair da Conta
          </Button>
        </motion.div>
      </div>
    </MainLayout>
  );
}
