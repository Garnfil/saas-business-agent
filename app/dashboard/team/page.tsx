"use client";

import {useState} from "react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
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
import {Badge} from "@/components/ui/badge";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {DashboardHeader} from "@/components/dashboard-header";
import {Icons} from "@/components/icons";
import {useToast} from "@/hooks/use-toast";

interface TeamMember {
    id: string;
    name: string;
    email: string;
    role: string;
    status: "active" | "pending" | "inactive";
    avatar?: string;
    lastActive: string;
    joinedDate: string;
    permissions: string[];
}

const mockTeamMembers: TeamMember[] = [
    {
        id: "1",
        name: "John Doe",
        email: "john.doe@acme.com",
        role: "Owner",
        status: "active",
        avatar: "/placeholder.svg?height=40&width=40",
        lastActive: "2 minutes ago",
        joinedDate: "Jan 2023",
        permissions: ["admin", "billing", "users", "data"],
    },
    {
        id: "2",
        name: "Sarah Wilson",
        email: "sarah.wilson@acme.com",
        role: "Administrator",
        status: "active",
        avatar: "/placeholder.svg?height=40&width=40",
        lastActive: "1 hour ago",
        joinedDate: "Mar 2023",
        permissions: ["admin", "users", "data"],
    },
    {
        id: "3",
        name: "Mike Johnson",
        email: "mike.johnson@acme.com",
        role: "Business Analyst",
        status: "active",
        lastActive: "3 hours ago",
        joinedDate: "Jun 2023",
        permissions: ["data", "reports"],
    },
    {
        id: "4",
        name: "Emily Chen",
        email: "emily.chen@acme.com",
        role: "Manager",
        status: "pending",
        lastActive: "Never",
        joinedDate: "Dec 2023",
        permissions: ["data", "reports", "users"],
    },
    {
        id: "5",
        name: "David Brown",
        email: "david.brown@acme.com",
        role: "End User",
        status: "inactive",
        lastActive: "2 weeks ago",
        joinedDate: "Aug 2023",
        permissions: ["data"],
    },
];

export default function TeamPage() {
    const [teamMembers, setTeamMembers] =
        useState<TeamMember[]>(mockTeamMembers);
    const [isInviteDialogOpen, setIsInviteDialogOpen] =
        useState(false);
    const [inviteData, setInviteData] = useState({
        email: "",
        role: "",
        message: "",
    });
    const [isLoading, setIsLoading] = useState(false);
    const {toast} = useToast();

    const handleInvite = async () => {
        setIsLoading(true);
        // Simulate API call
        setTimeout(() => {
            const newMember: TeamMember = {
                id: Date.now().toString(),
                name: inviteData.email.split("@")[0],
                email: inviteData.email,
                role: inviteData.role,
                status: "pending",
                lastActive: "Never",
                joinedDate: "Dec 2023",
                permissions: getRolePermissions(inviteData.role),
            };
            setTeamMembers([...teamMembers, newMember]);
            setIsLoading(false);
            setIsInviteDialogOpen(false);
            setInviteData({email: "", role: "", message: ""});
            toast({
                title: "Invitation sent",
                description: `An invitation has been sent to ${inviteData.email}`,
            });
        }, 1000);
    };

    const getRolePermissions = (role: string): string[] => {
        switch (role) {
            case "Owner":
                return ["admin", "billing", "users", "data"];
            case "Administrator":
                return ["admin", "users", "data"];
            case "Manager":
                return ["data", "reports", "users"];
            case "Business Analyst":
                return ["data", "reports"];
            case "End User":
                return ["data"];
            default:
                return [];
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "active":
                return <Badge className="bg-green-500">Active</Badge>;
            case "pending":
                return <Badge variant="secondary">Pending</Badge>;
            case "inactive":
                return <Badge variant="outline">Inactive</Badge>;
            default:
                return <Badge variant="outline">Unknown</Badge>;
        }
    };

    const getRoleBadge = (role: string) => {
        switch (role) {
            case "Owner":
                return <Badge variant="default">Owner</Badge>;
            case "Administrator":
                return <Badge className="bg-blue-500">Admin</Badge>;
            case "Manager":
                return (
                    <Badge className="bg-purple-500">Manager</Badge>
                );
            case "Business Analyst":
                return (
                    <Badge className="bg-orange-500">Analyst</Badge>
                );
            case "End User":
                return <Badge variant="secondary">User</Badge>;
            default:
                return <Badge variant="outline">Unknown</Badge>;
        }
    };

    const handleRemoveMember = (memberId: string) => {
        setTeamMembers(
            teamMembers.filter((member) => member.id !== memberId)
        );
        toast({
            title: "Member removed",
            description:
                "The team member has been removed successfully.",
        });
    };

    const handleResendInvite = (memberEmail: string) => {
        toast({
            title: "Invitation resent",
            description: `A new invitation has been sent to ${memberEmail}`,
        });
    };

    return (
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
            <DashboardHeader title="Team Management" />

            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold">
                        Team Members
                    </h2>
                    <p className="text-slate-600 dark:text-slate-400">
                        Manage your organization's team members and
                        permissions
                    </p>
                </div>
                <Dialog
                    open={isInviteDialogOpen}
                    onOpenChange={setIsInviteDialogOpen}
                >
                    <DialogTrigger asChild>
                        <Button className="bg-green-600 hover:bg-green-700">
                            <Icons.plus className="w-4 h-4 mr-2" />
                            Invite Member
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>
                                Invite Team Member
                            </DialogTitle>
                            <DialogDescription>
                                Send an invitation to join your
                                organization
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">
                                    Email Address
                                </Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="colleague@company.com"
                                    value={inviteData.email}
                                    onChange={(e) =>
                                        setInviteData({
                                            ...inviteData,
                                            email: e.target.value,
                                        })
                                    }
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="role">Role</Label>
                                <Select
                                    onValueChange={(value) =>
                                        setInviteData({
                                            ...inviteData,
                                            role: value,
                                        })
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a role" />
                                    </SelectTrigger>
                                    <SelectContent>
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
                                <Label htmlFor="message">
                                    Personal Message (Optional)
                                </Label>
                                <Input
                                    id="message"
                                    placeholder="Welcome to our team!"
                                    value={inviteData.message}
                                    onChange={(e) =>
                                        setInviteData({
                                            ...inviteData,
                                            message: e.target.value,
                                        })
                                    }
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button
                                variant="outline"
                                onClick={() =>
                                    setIsInviteDialogOpen(false)
                                }
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleInvite}
                                disabled={
                                    isLoading ||
                                    !inviteData.email ||
                                    !inviteData.role
                                }
                            >
                                {isLoading && (
                                    <Icons.spinner className="w-4 h-4 mr-2 animate-spin" />
                                )}
                                Send Invitation
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <Tabs defaultValue="members" className="w-full">
                <TabsList>
                    <TabsTrigger value="members">
                        Members ({teamMembers.length})
                    </TabsTrigger>
                    <TabsTrigger value="roles">
                        Roles & Permissions
                    </TabsTrigger>
                    <TabsTrigger value="invitations">
                        Pending Invitations
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="members" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Team Members</CardTitle>
                            <CardDescription>
                                Manage your team members and their
                                access levels
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {teamMembers.map((member) => (
                                    <div
                                        key={member.id}
                                        className="flex items-center justify-between p-4 border rounded-lg"
                                    >
                                        <div className="flex items-center gap-4">
                                            <Avatar className="h-10 w-10">
                                                <AvatarImage
                                                    src={
                                                        member.avatar ||
                                                        "/placeholder.svg"
                                                    }
                                                    alt={member.name}
                                                />
                                                <AvatarFallback>
                                                    {member.name
                                                        .split(" ")
                                                        .map(
                                                            (n) =>
                                                                n[0]
                                                        )
                                                        .join("")}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <h3 className="font-semibold">
                                                        {member.name}
                                                    </h3>
                                                    {getRoleBadge(
                                                        member.role
                                                    )}
                                                    {getStatusBadge(
                                                        member.status
                                                    )}
                                                </div>
                                                <p className="text-sm text-slate-600 dark:text-slate-400">
                                                    {member.email}
                                                </p>
                                                <p className="text-xs text-slate-500">
                                                    Last active:{" "}
                                                    {
                                                        member.lastActive
                                                    }{" "}
                                                    • Joined:{" "}
                                                    {
                                                        member.joinedDate
                                                    }
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {member.status ===
                                                "pending" && (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() =>
                                                        handleResendInvite(
                                                            member.email
                                                        )
                                                    }
                                                    className="bg-transparent"
                                                >
                                                    <Icons.refreshCw className="w-4 h-4 mr-2" />
                                                    Resend
                                                </Button>
                                            )}
                                            <DropdownMenu>
                                                <DropdownMenuTrigger
                                                    asChild
                                                >
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                    >
                                                        <Icons.moreHorizontal className="w-4 h-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem>
                                                        <Icons.user className="w-4 h-4 mr-2" />
                                                        View Profile
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem>
                                                        <Icons.settings className="w-4 h-4 mr-2" />
                                                        Edit Role
                                                    </DropdownMenuItem>
                                                    {member.role !==
                                                        "Owner" && (
                                                        <DropdownMenuItem
                                                            className="text-red-600"
                                                            onClick={() =>
                                                                handleRemoveMember(
                                                                    member.id
                                                                )
                                                            }
                                                        >
                                                            <Icons.x className="w-4 h-4 mr-2" />
                                                            Remove
                                                        </DropdownMenuItem>
                                                    )}
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="roles" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Roles & Permissions</CardTitle>
                            <CardDescription>
                                Overview of different roles and their
                                permissions
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-6">
                                {[
                                    {
                                        role: "Owner",
                                        description:
                                            "Full access to all features and settings",
                                        permissions: [
                                            "Full admin access",
                                            "Billing management",
                                            "User management",
                                            "Data access",
                                        ],
                                        color: "bg-red-500",
                                    },
                                    {
                                        role: "Administrator",
                                        description:
                                            "Manage users and organization settings",
                                        permissions: [
                                            "Admin access",
                                            "User management",
                                            "Data access",
                                            "Settings management",
                                        ],
                                        color: "bg-blue-500",
                                    },
                                    {
                                        role: "Manager",
                                        description:
                                            "Manage team members and view reports",
                                        permissions: [
                                            "Data access",
                                            "Report generation",
                                            "Limited user management",
                                        ],
                                        color: "bg-purple-500",
                                    },
                                    {
                                        role: "Business Analyst",
                                        description:
                                            "Access data and generate insights",
                                        permissions: [
                                            "Data access",
                                            "Report generation",
                                            "Analytics tools",
                                        ],
                                        color: "bg-orange-500",
                                    },
                                    {
                                        role: "End User",
                                        description:
                                            "Basic access to AI assistant and data",
                                        permissions: [
                                            "Data access",
                                            "AI assistant",
                                            "Basic reporting",
                                        ],
                                        color: "bg-gray-500",
                                    },
                                ].map((roleInfo) => (
                                    <div
                                        key={roleInfo.role}
                                        className="border rounded-lg p-4"
                                    >
                                        <div className="flex items-center gap-3 mb-3">
                                            <Badge
                                                className={
                                                    roleInfo.color
                                                }
                                            >
                                                {roleInfo.role}
                                            </Badge>
                                            <h3 className="font-semibold">
                                                {roleInfo.description}
                                            </h3>
                                        </div>
                                        <div className="grid gap-2 md:grid-cols-2">
                                            {roleInfo.permissions.map(
                                                (permission) => (
                                                    <div
                                                        key={
                                                            permission
                                                        }
                                                        className="flex items-center gap-2"
                                                    >
                                                        <Icons.check className="w-4 h-4 text-green-500" />
                                                        <span className="text-sm">
                                                            {
                                                                permission
                                                            }
                                                        </span>
                                                    </div>
                                                )
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent
                    value="invitations"
                    className="space-y-4"
                >
                    <Card>
                        <CardHeader>
                            <CardTitle>Pending Invitations</CardTitle>
                            <CardDescription>
                                Manage outstanding team invitations
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {teamMembers
                                    .filter(
                                        (member) =>
                                            member.status ===
                                            "pending"
                                    )
                                    .map((member) => (
                                        <div
                                            key={member.id}
                                            className="flex items-center justify-between p-4 border rounded-lg"
                                        >
                                            <div>
                                                <h3 className="font-semibold">
                                                    {member.email}
                                                </h3>
                                                <p className="text-sm text-slate-600 dark:text-slate-400">
                                                    Invited as{" "}
                                                    {member.role} •
                                                    Sent on{" "}
                                                    {
                                                        member.joinedDate
                                                    }
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() =>
                                                        handleResendInvite(
                                                            member.email
                                                        )
                                                    }
                                                    className="bg-transparent"
                                                >
                                                    <Icons.refreshCw className="w-4 h-4 mr-2" />
                                                    Resend
                                                </Button>
                                                <Button
                                                    variant="destructive"
                                                    size="sm"
                                                    onClick={() =>
                                                        handleRemoveMember(
                                                            member.id
                                                        )
                                                    }
                                                >
                                                    <Icons.x className="w-4 h-4 mr-2" />
                                                    Cancel
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                {teamMembers.filter(
                                    (member) =>
                                        member.status === "pending"
                                ).length === 0 && (
                                    <div className="text-center py-8">
                                        <Icons.users className="w-12 h-12 mx-auto text-slate-400 mb-4" />
                                        <h3 className="text-lg font-semibold mb-2">
                                            No pending invitations
                                        </h3>
                                        <p className="text-slate-600 dark:text-slate-400">
                                            All team members have
                                            accepted their invitations
                                        </p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
