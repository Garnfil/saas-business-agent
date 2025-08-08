"use client";

import type React from "react";
import {useState} from "react";
import Link from "next/link";
import {useRouter} from "next/navigation";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {Checkbox} from "@/components/ui/checkbox";
import {Icons} from "@/components/icons";
import {useToast} from "@/hooks/use-toast";

export default function RegisterPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        // Organization details
        organizationName: "",
        organizationSize: "",
        industry: "",
        subdomain: "",
        // User details
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        confirmPassword: "",
        role: "",
        // Agreement
        agreeToTerms: false,
    });
    const router = useRouter();
    const {toast} = useToast();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (step === 1) {
            setStep(2);
            return;
        }

        setIsLoading(true);

        // Simulate registration
        setTimeout(() => {
            setIsLoading(false);
            toast({
                title: "Registration successful",
                description: `Welcome to ${formData.organizationName}! Your tenant has been created.`,
            });
            router.push("/dashboard");
        }, 2000);
    };

    const handleInputChange = (
        field: string,
        value: string | boolean
    ) => {
        setFormData((prev) => ({...prev, [field]: value}));
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
            <div className="absolute inset-0 bg-[url('/placeholder.svg?height=1080&width=1920&text=AI+Background')] opacity-10"></div>

            <Card className="w-full max-w-md relative z-10 bg-slate-800/50 border-slate-700 backdrop-blur-sm">
                <CardHeader className="space-y-1">
                    <div className="flex items-center justify-center mb-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-blue-500 rounded-lg flex items-center justify-center">
                            <Icons.bot className="w-6 h-6 text-white" />
                        </div>
                    </div>
                    <CardTitle className="text-2xl text-center text-white">
                        {step === 1
                            ? "Create Organization"
                            : "Create Account"}
                    </CardTitle>
                    <CardDescription className="text-center text-slate-400">
                        {step === 1
                            ? "Set up your organization tenant"
                            : "Complete your account setup"}
                    </CardDescription>
                    <div className="flex justify-center space-x-2 mt-4">
                        <div
                            className={`w-3 h-3 rounded-full ${
                                step >= 1
                                    ? "bg-slate-500"
                                    : "bg-slate-600"
                            }`}
                        ></div>
                        <div
                            className={`w-3 h-3 rounded-full ${
                                step >= 2
                                    ? "bg-slate-500"
                                    : "bg-slate-600"
                            }`}
                        ></div>
                    </div>
                </CardHeader>
                <form onSubmit={handleSubmit}>
                    <CardContent className="space-y-4">
                        {step === 1 ? (
                            <>
                                <div className="space-y-2">
                                    <Label
                                        htmlFor="organizationName"
                                        className="text-slate-200"
                                    >
                                        Organization Name
                                    </Label>
                                    <Input
                                        id="organizationName"
                                        placeholder="Acme Corporation"
                                        value={
                                            formData.organizationName
                                        }
                                        onChange={(e) =>
                                            handleInputChange(
                                                "organizationName",
                                                e.target.value
                                            )
                                        }
                                        className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label
                                        htmlFor="subdomain"
                                        className="text-slate-200"
                                    >
                                        Subdomain
                                    </Label>
                                    <div className="flex">
                                        <Input
                                            id="subdomain"
                                            placeholder="acme"
                                            value={formData.subdomain}
                                            onChange={(e) =>
                                                handleInputChange(
                                                    "subdomain",
                                                    e.target.value
                                                )
                                            }
                                            className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 rounded-r-none"
                                            required
                                        />
                                        <div className="bg-slate-600 border border-l-0 border-slate-600 px-3 py-2 text-slate-300 text-sm rounded-r-md">
                                            .aiassistant.com
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label
                                        htmlFor="organizationSize"
                                        className="text-slate-200"
                                    >
                                        Organization Size
                                    </Label>
                                    <Select
                                        onValueChange={(value) =>
                                            handleInputChange(
                                                "organizationSize",
                                                value
                                            )
                                        }
                                    >
                                        <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white">
                                            <SelectValue placeholder="Select organization size" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-slate-800 border-slate-700">
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
                                <div className="space-y-2">
                                    <Label
                                        htmlFor="industry"
                                        className="text-slate-200"
                                    >
                                        Industry
                                    </Label>
                                    <Select
                                        onValueChange={(value) =>
                                            handleInputChange(
                                                "industry",
                                                value
                                            )
                                        }
                                    >
                                        <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white">
                                            <SelectValue placeholder="Select your industry" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-slate-800 border-slate-700">
                                            <SelectItem value="technology">
                                                Technology
                                            </SelectItem>
                                            <SelectItem value="finance">
                                                Finance
                                            </SelectItem>
                                            <SelectItem value="healthcare">
                                                Healthcare
                                            </SelectItem>
                                            <SelectItem value="retail">
                                                Retail
                                            </SelectItem>
                                            <SelectItem value="manufacturing">
                                                Manufacturing
                                            </SelectItem>
                                            <SelectItem value="education">
                                                Education
                                            </SelectItem>
                                            <SelectItem value="other">
                                                Other
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label
                                            htmlFor="firstName"
                                            className="text-slate-200"
                                        >
                                            First Name
                                        </Label>
                                        <Input
                                            id="firstName"
                                            placeholder="John"
                                            value={formData.firstName}
                                            onChange={(e) =>
                                                handleInputChange(
                                                    "firstName",
                                                    e.target.value
                                                )
                                            }
                                            className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label
                                            htmlFor="lastName"
                                            className="text-slate-200"
                                        >
                                            Last Name
                                        </Label>
                                        <Input
                                            id="lastName"
                                            placeholder="Doe"
                                            value={formData.lastName}
                                            onChange={(e) =>
                                                handleInputChange(
                                                    "lastName",
                                                    e.target.value
                                                )
                                            }
                                            className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label
                                        htmlFor="email"
                                        className="text-slate-200"
                                    >
                                        Email
                                    </Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="john@acme.com"
                                        value={formData.email}
                                        onChange={(e) =>
                                            handleInputChange(
                                                "email",
                                                e.target.value
                                            )
                                        }
                                        className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label
                                        htmlFor="role"
                                        className="text-slate-200"
                                    >
                                        Role
                                    </Label>
                                    <Select
                                        onValueChange={(value) =>
                                            handleInputChange(
                                                "role",
                                                value
                                            )
                                        }
                                    >
                                        <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white">
                                            <SelectValue placeholder="Select your role" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-slate-800 border-slate-700">
                                            <SelectItem value="owner">
                                                Owner
                                            </SelectItem>
                                            <SelectItem value="admin">
                                                Administrator
                                            </SelectItem>
                                            <SelectItem value="manager">
                                                Manager
                                            </SelectItem>
                                            <SelectItem value="analyst">
                                                Business Analyst
                                            </SelectItem>
                                            <SelectItem value="user">
                                                End User
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label
                                        htmlFor="password"
                                        className="text-slate-200"
                                    >
                                        Password
                                    </Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        placeholder="Create a password"
                                        value={formData.password}
                                        onChange={(e) =>
                                            handleInputChange(
                                                "password",
                                                e.target.value
                                            )
                                        }
                                        className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label
                                        htmlFor="confirmPassword"
                                        className="text-slate-200"
                                    >
                                        Confirm Password
                                    </Label>
                                    <Input
                                        id="confirmPassword"
                                        type="password"
                                        placeholder="Confirm your password"
                                        value={
                                            formData.confirmPassword
                                        }
                                        onChange={(e) =>
                                            handleInputChange(
                                                "confirmPassword",
                                                e.target.value
                                            )
                                        }
                                        className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
                                        required
                                    />
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="terms"
                                        checked={
                                            formData.agreeToTerms
                                        }
                                        onCheckedChange={(checked) =>
                                            handleInputChange(
                                                "agreeToTerms",
                                                checked as boolean
                                            )
                                        }
                                    />
                                    <Label
                                        htmlFor="terms"
                                        className="text-sm text-slate-200"
                                    >
                                        I agree to the{" "}
                                        <Link
                                            href="/terms"
                                            className="text-green-400 hover:text-green-300 underline"
                                        >
                                            Terms of Service
                                        </Link>{" "}
                                        and{" "}
                                        <Link
                                            href="/privacy"
                                            className="text-green-400 hover:text-green-300 underline"
                                        >
                                            Privacy Policy
                                        </Link>
                                    </Label>
                                </div>
                            </>
                        )}
                    </CardContent>
                    <CardFooter className="flex flex-col space-y-4">
                        <div className="flex gap-2 w-full">
                            {step === 2 && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setStep(1)}
                                    className="flex-1 bg-transparent border-slate-600 text-slate-200 hover:bg-slate-700"
                                >
                                    Back
                                </Button>
                            )}
                            <Button
                                type="submit"
                                className="flex-1 bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700"
                                disabled={
                                    isLoading ||
                                    (step === 2 &&
                                        !formData.agreeToTerms)
                                }
                            >
                                {isLoading && (
                                    <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                                )}
                                {step === 1
                                    ? "Continue"
                                    : "Create Account"}
                            </Button>
                        </div>
                        <p className="text-sm text-slate-400 text-center">
                            Already have an account?{" "}
                            <Link
                                href="/login"
                                className="text-green-400 hover:text-green-300 underline"
                            >
                                Sign in
                            </Link>
                        </p>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}
