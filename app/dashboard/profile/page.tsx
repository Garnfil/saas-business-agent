"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { DashboardHeader } from "@/components/dashboard-header";
import { Icons } from "@/components/icons";
import { useToast } from "@/hooks/use-toast";

export default function ProfilePage() {
  const [isLoading, setIsLoading] = useState(false);
  const [profileData, setProfileData] = useState({
    firstName: "John",
    middleName: "",
    lastName: "Doe",
    email: "john.doe@acme.com",
    phone: "+1 (555) 123-4567",
    bio: "Business analyst with 5+ years of experience in data-driven decision making.",
    role: "Business Analyst",
    department: "Analytics",
    timezone: "America/New_York",
    language: "English",
    avatar: "/placeholder.svg?height=100&width=100",
  });

  const [organizationData, setOrganizationData] = useState({
    name: "Acme Corporation",
    subdomain: "acme",
    industry: "Technology",
    size: "51-200",
    website: "https://acme.com",
    description:
      "Leading technology solutions provider focused on AI and automation.",
  });

  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    pushNotifications: false,
    voiceResponses: true,
    dataInsights: true,
    weeklyReports: true,
    securityAlerts: true,
  });

  const { toast } = useToast();

  const handleProfileSave = async () => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "Profile updated",
        description:
          "Your profile information has been saved successfully.",
      });
    }, 1000);
  };

  const handleOrganizationSave = async () => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "Organization updated",
        description:
          "Your organization settings have been saved successfully.",
      });
    }, 1000);
  };

  const handlePreferencesSave = async () => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "Preferences updated",
        description:
          "Your notification preferences have been saved successfully.",
      });
    }, 1000);
  };

  const handleInputChange = (
    section: string,
    field: string,
    value: string | boolean
  ) => {
    if (section === "profile") {
      setProfileData((prev) => ({ ...prev, [field]: value }));
    } else if (section === "organization") {
      setOrganizationData((prev) => ({
        ...prev,
        [field]: value,
      }));
    } else if (section === "preferences") {
      setPreferences((prev) => ({ ...prev, [field]: value }));
    }
  };

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <DashboardHeader title="Profile Settings" />

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile">
            Personal
          </TabsTrigger>
          <TabsTrigger value="organization">
            Organization
          </TabsTrigger>
          <TabsTrigger value="preferences">
            Preferences
          </TabsTrigger>
          <TabsTrigger value="security">
            Security
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>
                Personal Information
              </CardTitle>
              <CardDescription>
                Update your personal details and
                profile information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-6">
                <Avatar className="w-24 h-24">
                  <AvatarImage
                    src={
                      profileData.avatar ||
                      "/placeholder.svg"
                    }
                    alt="Profile"
                  />
                  <AvatarFallback className="text-lg">
                    {profileData.firstName[0]}
                    {profileData.lastName[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    className="bg-transparent"
                  >
                    <Icons.upload className="w-4 h-4 mr-2" />
                    Upload Photo
                  </Button>
                  <p className="text-xs text-slate-500">
                    JPG, PNG or GIF. Max size 2MB.
                  </p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="firstName">
                    First Name
                  </Label>
                  <Input
                    id="firstName"
                    value={profileData.firstName}
                    onChange={(e) =>
                      handleInputChange(
                        "profile",
                        "firstName",
                        e.target.value
                      )
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="middleName">
                    Middle Name
                  </Label>
                  <Input
                    id="middleName"
                    value={profileData.middleName}
                    onChange={(e) =>
                      handleInputChange(
                        "profile",
                        "middleName",
                        e.target.value
                      )
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">
                    Last Name
                  </Label>
                  <Input
                    id="lastName"
                    value={profileData.lastName}
                    onChange={(e) =>
                      handleInputChange(
                        "profile",
                        "lastName",
                        e.target.value
                      )
                    }
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="email">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={profileData.email}
                    onChange={(e) =>
                      handleInputChange(
                        "profile",
                        "email",
                        e.target.value
                      )
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">
                    Phone
                  </Label>
                  <Input
                    id="phone"
                    value={profileData.phone}
                    onChange={(e) =>
                      handleInputChange(
                        "profile",
                        "phone",
                        e.target.value
                      )
                    }
                  />
                </div>
              </div>

              {/* <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Select
                    value={profileData.role}
                    onValueChange={(value) =>
                      handleInputChange(
                        "profile",
                        "role",
                        value
                      )
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Owner">
                        Owner
                      </SelectItem>
                      <SelectItem value="Administrator">
                        Administrator
                      </SelectItem>
                      <SelectItem value="Manager">
                        Manager
                      </SelectItem>
                      <SelectItem value="Business Analyst">
                        Business Analyst
                      </SelectItem>
                      <SelectItem value="End User">
                        End User
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="department">
                    Department
                  </Label>
                  <Select
                    value={profileData.department}
                    onValueChange={(value) =>
                      handleInputChange(
                        "profile",
                        "department",
                        value
                      )
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Analytics">
                        Analytics
                      </SelectItem>
                      <SelectItem value="Sales">
                        Sales
                      </SelectItem>
                      <SelectItem value="Marketing">
                        Marketing
                      </SelectItem>
                      <SelectItem value="Operations">
                        Operations
                      </SelectItem>
                      <SelectItem value="Finance">
                        Finance
                      </SelectItem>
                      <SelectItem value="IT">
                        IT
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timezone">
                    Timezone
                  </Label>
                  <Select
                    value={profileData.timezone}
                    onValueChange={(value) =>
                      handleInputChange(
                        "profile",
                        "timezone",
                        value
                      )
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="America/New_York">
                        Eastern Time
                      </SelectItem>
                      <SelectItem value="America/Chicago">
                        Central Time
                      </SelectItem>
                      <SelectItem value="America/Denver">
                        Mountain Time
                      </SelectItem>
                      <SelectItem value="America/Los_Angeles">
                        Pacific Time
                      </SelectItem>
                      <SelectItem value="Europe/London">
                        London
                      </SelectItem>
                      <SelectItem value="Europe/Paris">
                        Paris
                      </SelectItem>
                      <SelectItem value="Asia/Tokyo">
                        Tokyo
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div> */}

              <Button
                onClick={handleProfileSave}
                disabled={isLoading}
              >
                {isLoading && (
                  <Icons.spinner className="w-4 h-4 mr-2 animate-spin" />
                )}
                Save Changes
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent
          value="organization"
          className="space-y-4"
        >
          <Card>
            <CardHeader>
              <CardTitle>
                Organization Settings
              </CardTitle>
              <CardDescription>
                Manage your organization's information
                and settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="orgName">
                    Organization Name
                  </Label>
                  <Input
                    id="orgName"
                    value={organizationData.name}
                    onChange={(e) =>
                      handleInputChange(
                        "organization",
                        "name",
                        e.target.value
                      )
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subdomain">
                    Subdomain
                  </Label>
                  <div className="flex">
                    <Input
                      id="subdomain"
                      value={
                        organizationData.subdomain
                      }
                      onChange={(e) =>
                        handleInputChange(
                          "organization",
                          "subdomain",
                          e.target.value
                        )
                      }
                      className="rounded-r-none"
                    />
                    <div className="bg-slate-100 dark:bg-slate-800 border border-l-0 px-3 py-2 text-slate-600 dark:text-slate-400 text-sm rounded-r-md">
                      .aiassistant.com
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="industry">
                    Industry
                  </Label>
                  <Select
                    value={
                      organizationData.industry
                    }
                    onValueChange={(value) =>
                      handleInputChange(
                        "organization",
                        "industry",
                        value
                      )
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Technology">
                        Technology
                      </SelectItem>
                      <SelectItem value="Finance">
                        Finance
                      </SelectItem>
                      <SelectItem value="Healthcare">
                        Healthcare
                      </SelectItem>
                      <SelectItem value="Retail">
                        Retail
                      </SelectItem>
                      <SelectItem value="Manufacturing">
                        Manufacturing
                      </SelectItem>
                      <SelectItem value="Education">
                        Education
                      </SelectItem>
                      <SelectItem value="Other">
                        Other
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="size">
                    Organization Size
                  </Label>
                  <Select
                    value={organizationData.size}
                    onValueChange={(value) =>
                      handleInputChange(
                        "organization",
                        "size",
                        value
                      )
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1-10">
                        1-10 employees
                      </SelectItem>
                      <SelectItem value="11-50">
                        11-50 employees
                      </SelectItem>
                      <SelectItem value="51-200">
                        51-200 employees
                      </SelectItem>
                      <SelectItem value="201-1000">
                        201-1000 employees
                      </SelectItem>
                      <SelectItem value="1000+">
                        1000+ employees
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="website">
                  Website
                </Label>
                <Input
                  id="website"
                  type="url"
                  value={organizationData.website}
                  onChange={(e) =>
                    handleInputChange(
                      "organization",
                      "website",
                      e.target.value
                    )
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">
                  Description
                </Label>
                <Textarea
                  id="description"
                  value={
                    organizationData.description
                  }
                  onChange={(e) =>
                    handleInputChange(
                      "organization",
                      "description",
                      e.target.value
                    )
                  }
                  rows={3}
                />
              </div>

              <Button
                onClick={handleOrganizationSave}
                disabled={isLoading}
              >
                {isLoading && (
                  <Icons.spinner className="w-4 h-4 mr-2 animate-spin" />
                )}
                Save Changes
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Billing Information</CardTitle>
              <CardDescription>
                Current plan and billing details
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h3 className="font-semibold">
                    Professional Plan
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    $49/month • Next billing: Jan
                    15, 2024
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className="bg-slate-500">
                    Active
                  </Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-transparent"
                  >
                    Manage
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent
          value="preferences"
          className="space-y-4"
        >
          <Card>
            <CardHeader>
              <CardTitle>
                Notification Preferences
              </CardTitle>
              <CardDescription>
                Choose how you want to receive
                notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="emailNotifications">
                      Email Notifications
                    </Label>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Receive notifications via
                      email
                    </p>
                  </div>
                  <Switch
                    id="emailNotifications"
                    checked={
                      preferences.emailNotifications
                    }
                    onCheckedChange={(checked) =>
                      handleInputChange(
                        "preferences",
                        "emailNotifications",
                        checked
                      )
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="pushNotifications">
                      Push Notifications
                    </Label>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Receive push notifications
                      in your browser
                    </p>
                  </div>
                  <Switch
                    id="pushNotifications"
                    checked={
                      preferences.pushNotifications
                    }
                    onCheckedChange={(checked) =>
                      handleInputChange(
                        "preferences",
                        "pushNotifications",
                        checked
                      )
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="voiceResponses">
                      Voice Responses
                    </Label>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Enable voice responses
                      from AI assistant
                    </p>
                  </div>
                  <Switch
                    id="voiceResponses"
                    checked={
                      preferences.voiceResponses
                    }
                    onCheckedChange={(checked) =>
                      handleInputChange(
                        "preferences",
                        "voiceResponses",
                        checked
                      )
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="dataInsights">
                      Data Insights
                    </Label>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Receive automated insights
                      about your data
                    </p>
                  </div>
                  <Switch
                    id="dataInsights"
                    checked={
                      preferences.dataInsights
                    }
                    onCheckedChange={(checked) =>
                      handleInputChange(
                        "preferences",
                        "dataInsights",
                        checked
                      )
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="weeklyReports">
                      Weekly Reports
                    </Label>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Get weekly summary reports
                    </p>
                  </div>
                  <Switch
                    id="weeklyReports"
                    checked={
                      preferences.weeklyReports
                    }
                    onCheckedChange={(checked) =>
                      handleInputChange(
                        "preferences",
                        "weeklyReports",
                        checked
                      )
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="securityAlerts">
                      Security Alerts
                    </Label>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Important security
                      notifications
                    </p>
                  </div>
                  <Switch
                    id="securityAlerts"
                    checked={
                      preferences.securityAlerts
                    }
                    onCheckedChange={(checked) =>
                      handleInputChange(
                        "preferences",
                        "securityAlerts",
                        checked
                      )
                    }
                  />
                </div>
              </div>

              <Button
                onClick={handlePreferencesSave}
                disabled={isLoading}
              >
                {isLoading && (
                  <Icons.spinner className="w-4 h-4 mr-2 animate-spin" />
                )}
                Save Preferences
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>
                Manage your account security and
                authentication
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-semibold">
                      Password
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Last changed 3 months ago
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    className="bg-transparent"
                  >
                    Change Password
                  </Button>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-semibold">
                      Two-Factor Authentication
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Add an extra layer of
                      security to your account
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">
                      Disabled
                    </Badge>
                    <Button
                      variant="outline"
                      className="bg-transparent"
                    >
                      Enable
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-semibold">
                      API Keys
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Manage API keys for
                      integrations
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    className="bg-transparent"
                  >
                    Manage Keys
                  </Button>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-semibold">
                      Active Sessions
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      View and manage your
                      active sessions
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    className="bg-transparent"
                  >
                    View Sessions
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-red-600">
                Danger Zone
              </CardTitle>
              <CardDescription>
                Irreversible and destructive actions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-red-200 dark:border-red-800 rounded-lg">
                  <div>
                    <h3 className="font-semibold text-red-600">
                      Delete Account
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Permanently delete your
                      account and all data
                    </p>
                  </div>
                  <Button variant="destructive">
                    Delete Account
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
