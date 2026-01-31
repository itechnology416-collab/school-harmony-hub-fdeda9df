import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  Shield,
  LogOut,
  Camera,
  Loader2,
  Save
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PageHeader } from '@/components/common/PageHeader';
import { Avatar } from '@/components/common/Avatar';
import { useAuth } from '@/contexts/AuthContext';
import { useRoleBasedAccess } from '@/hooks/useRoleBasedAccess';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const ProfileScreen = () => {
  const navigate = useNavigate();
  const { profile, signOut, refreshProfile } = useAuth();
  const { primaryRole, roles } = useRoleBasedAccess();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    first_name: profile?.first_name || '',
    last_name: profile?.last_name || '',
    phone: profile?.phone || '',
    address: profile?.address || '',
  });

  const handleLogout = async () => {
    await signOut();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const handleSave = async () => {
    if (!profile?.user_id) return;
    
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: formData.first_name,
          last_name: formData.last_name,
          phone: formData.phone,
          address: formData.address,
        })
        .eq('user_id', profile.user_id);

      if (error) throw error;
      
      await refreshProfile();
      setIsEditing(false);
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const displayName = profile ? `${profile.first_name} ${profile.last_name}` : 'User';
  const roleDisplay = primaryRole ? primaryRole.charAt(0).toUpperCase() + primaryRole.slice(1) : 'User';

  return (
    <div className="screen-container px-4">
      <PageHeader
        title="Profile"
        subtitle="Manage your account"
        action={
          isEditing ? (
            <Button variant="gradient" size="sm" onClick={handleSave} disabled={isSaving}>
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            </Button>
          ) : (
            <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
              Edit
            </Button>
          )
        }
      />

      {/* Profile Header */}
      <div className="flex flex-col items-center mb-6">
        <div className="relative mb-4">
          <Avatar name={displayName} size="xl" />
          <button className="absolute bottom-0 right-0 p-2 rounded-full bg-primary text-primary-foreground shadow-lg">
            <Camera className="h-4 w-4" />
          </button>
        </div>
        <h2 className="text-xl font-bold text-foreground">{displayName}</h2>
        <div className="flex items-center gap-2 mt-1">
          <Shield className="h-4 w-4 text-primary" />
          <span className="text-sm text-primary font-medium">{roleDisplay}</span>
        </div>
        {roles.length > 1 && (
          <p className="text-xs text-muted-foreground mt-1">
            + {roles.length - 1} more role(s)
          </p>
        )}
      </div>

      {/* Profile Details */}
      <div className="space-y-4 bg-card rounded-2xl p-4 border border-border">
        <h3 className="font-semibold text-foreground mb-4">Personal Information</h3>
        
        <div className="space-y-4">
          {isEditing ? (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm text-muted-foreground">First Name</label>
                  <Input
                    value={formData.first_name}
                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                    placeholder="First name"
                  />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Last Name</label>
                  <Input
                    value={formData.last_name}
                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                    placeholder="Last name"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Phone</label>
                <Input
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="Phone number"
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Address</label>
                <Input
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Address"
                />
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-secondary">
                  <User className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Full Name</p>
                  <p className="text-sm font-medium text-foreground">{displayName}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-secondary">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Email</p>
                  <p className="text-sm font-medium text-foreground">{profile?.email || 'Not set'}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-secondary">
                  <Phone className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Phone</p>
                  <p className="text-sm font-medium text-foreground">{profile?.phone || 'Not set'}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-secondary">
                  <MapPin className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Address</p>
                  <p className="text-sm font-medium text-foreground">{profile?.address || 'Not set'}</p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Logout Button */}
      <Button
        variant="destructive"
        className="w-full mt-6"
        onClick={handleLogout}
      >
        <LogOut className="h-5 w-5 mr-2" />
        Sign Out
      </Button>
    </div>
  );
};

export default ProfileScreen;
