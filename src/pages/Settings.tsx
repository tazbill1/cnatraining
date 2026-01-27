import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { User, Building, Volume2, Gauge, MessageSquare, Lock, Save, Loader2 } from "lucide-react";

export default function Settings() {
  const { profile, refreshProfile, signOut } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    fullName: profile?.full_name || "",
    dealershipName: profile?.dealership_name || "",
    voiceEnabled: profile?.voice_enabled ?? true,
    difficultyDefault: profile?.difficulty_default || "intermediate",
    coachingIntensity: profile?.coaching_intensity || "medium",
  });

  const [passwordData, setPasswordData] = useState({
    newPassword: "",
    confirmPassword: "",
  });

  const handleSaveProfile = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: formData.fullName,
          dealership_name: formData.dealershipName,
          voice_enabled: formData.voiceEnabled,
          difficulty_default: formData.difficultyDefault,
          coaching_intensity: formData.coachingIntensity,
        })
        .eq("user_id", profile?.user_id);

      if (error) throw error;

      await refreshProfile();
      toast({
        title: "Settings saved",
        description: "Your preferences have been updated.",
      });
    } catch (error) {
      console.error("Error saving settings:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save settings. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        variant: "destructive",
        title: "Passwords don't match",
        description: "Please make sure both passwords are the same.",
      });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast({
        variant: "destructive",
        title: "Password too short",
        description: "Password must be at least 6 characters.",
      });
      return;
    }

    setPasswordLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword,
      });

      if (error) throw error;

      toast({
        title: "Password updated",
        description: "Your password has been changed successfully.",
      });
      setPasswordData({ newPassword: "", confirmPassword: "" });
    } catch (error) {
      console.error("Error changing password:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to change password. Please try again.",
      });
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <AuthGuard>
      <AppLayout>
        <div className="p-8 max-w-2xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Settings</h1>
            <p className="text-muted-foreground">
              Manage your profile and training preferences
            </p>
          </div>

          {/* Profile Section */}
          <div className="card-premium p-6 mb-6">
            <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-primary" />
              Profile Information
            </h2>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  value={formData.fullName}
                  onChange={(e) =>
                    setFormData({ ...formData, fullName: e.target.value })
                  }
                  placeholder="John Smith"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  value={profile?.email || ""}
                  disabled
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground">
                  Email cannot be changed
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="dealership" className="flex items-center gap-2">
                  <Building className="w-4 h-4" />
                  Dealership Name
                </Label>
                <Input
                  id="dealership"
                  value={formData.dealershipName}
                  onChange={(e) =>
                    setFormData({ ...formData, dealershipName: e.target.value })
                  }
                  placeholder="Acme Motors"
                />
              </div>
            </div>
          </div>

          {/* Preferences Section */}
          <div className="card-premium p-6 mb-6">
            <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <Gauge className="w-5 h-5 text-primary" />
              Training Preferences
            </h2>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Volume2 className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium text-foreground">Voice Enabled</p>
                    <p className="text-sm text-muted-foreground">
                      Enable voice recording during training
                    </p>
                  </div>
                </div>
                <Switch
                  checked={formData.voiceEnabled}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, voiceEnabled: checked })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Gauge className="w-4 h-4" />
                  Default Difficulty
                </Label>
                <Select
                  value={formData.difficultyDefault}
                  onValueChange={(value) =>
                    setFormData({ ...formData, difficultyDefault: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  Coaching Intensity
                </Label>
                <Select
                  value={formData.coachingIntensity}
                  onValueChange={(value) =>
                    setFormData({ ...formData, coachingIntensity: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low - Minimal tips</SelectItem>
                    <SelectItem value="medium">Medium - Balanced</SelectItem>
                    <SelectItem value="high">High - Detailed guidance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button
              onClick={handleSaveProfile}
              disabled={isLoading}
              className="mt-6 btn-gradient"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Save Changes
            </Button>
          </div>

          {/* Password Section */}
          <div className="card-premium p-6 mb-6">
            <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <Lock className="w-5 h-5 text-primary" />
              Change Password
            </h2>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) =>
                    setPasswordData({ ...passwordData, newPassword: e.target.value })
                  }
                  placeholder="••••••••"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      confirmPassword: e.target.value,
                    })
                  }
                  placeholder="••••••••"
                />
              </div>
              <Button
                onClick={handleChangePassword}
                disabled={passwordLoading || !passwordData.newPassword}
                variant="outline"
              >
                {passwordLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Lock className="w-4 h-4 mr-2" />
                )}
                Update Password
              </Button>
            </div>
          </div>

          {/* Logout */}
          <div className="card-premium p-6">
            <Button
              onClick={signOut}
              variant="destructive"
              className="w-full"
            >
              Sign Out
            </Button>
          </div>
        </div>
      </AppLayout>
    </AuthGuard>
  );
}
