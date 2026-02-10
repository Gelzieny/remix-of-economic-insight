import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { LogOut, Mail, Calendar, Crown, Settings, ChevronRight, FileText } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export default function Profile() {
  const { user, signOut } = useAuth();
  const [reportEnabled, setReportEnabled] = useState(false);
  const [loadingReport, setLoadingReport] = useState(true);

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

  const userInitials = user?.email?.slice(0, 2).toUpperCase() || 'U';
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
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h1 className="text-2xl font-bold text-foreground">Meu Perfil</h1>
          <p className="text-sm text-muted-foreground">
            Gerencie suas informações pessoais e configurações
          </p>
        </motion.div>

        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <Card className="border-border/50 bg-card">
            <CardContent className="p-6">
              <div className="flex flex-col items-center gap-6 sm:flex-row">
                <Avatar className="h-24 w-24 border-4 border-primary/20">
                  <AvatarFallback className="bg-primary/20 text-primary text-2xl">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 text-center sm:text-left">
                  <h2 className="text-xl font-semibold text-foreground">
                    {user?.email?.split('@')[0] || 'Usuário'}
                  </h2>
                  <p className="text-sm text-muted-foreground">{user?.email}</p>
                  <div className="mt-2 flex items-center justify-center gap-2 sm:justify-start">
                    <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                      <Crown className="h-3 w-3" />
                      Plano Gratuito
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Account Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <Card className="border-border/50 bg-card">
            <CardHeader>
              <CardTitle className="text-base font-semibold">
                Informações da Conta
              </CardTitle>
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
                  <p className="text-sm font-medium text-foreground">
                    {joinedDate}
                  </p>
                </div>
              </div>

              <Separator className="bg-border/50" />

              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                  <Crown className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground">Plano Atual</p>
                  <p className="text-sm font-medium text-foreground">Gratuito</p>
                </div>
                <Button variant="ghost" size="sm" className="gap-1 text-primary">
                  Alterar
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <Card className="border-border/50 bg-card">
            <CardHeader>
              <CardTitle className="text-base font-semibold">
                Preferências
              </CardTitle>
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
                    <p className="text-xs text-muted-foreground">
                      Receber relatório diário por e-mail
                    </p>
                  </div>
                </div>
                <Switch
                  id="report-toggle"
                  checked={reportEnabled}
                  onCheckedChange={toggleReport}
                  disabled={loadingReport}
                />
              </div>

              <Separator className="bg-border/50" />

              <Button variant="ghost" className="w-full justify-between">
                <div className="flex items-center gap-3">
                  <Settings className="h-5 w-5 text-muted-foreground" />
                  <span>Configurações</span>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Logout Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
        >
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
