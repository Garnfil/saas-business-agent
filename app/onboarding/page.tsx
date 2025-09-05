"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
import { Icons } from "@/components/icons";
import { useToast } from "@/hooks/use-toast";
import { DataSourceSelector } from "@/components/data-source-selector";
import { OnboardingHeader } from "@/components/onboarding-header";
import { updateProfile, updateTenant, type ActionResult } from "@/lib/actions/onboarding";
import { getUser } from "@/lib/actions/auth/getUser";
import { getTenant } from "@/lib/actions/tenant/tenant";

interface OnboardingData {
  // Profile Step
  first_name: string;
  middle_name: string;
  last_name: string;
  phone_number: string;
  country_code: string;
  avatar?: string;

  // Organization Step
  organization_name: string;
  industry: string;
  organization_size: string;
  website: string;
  description: string;
  primary_use_case: string;

  // Data Source Step
  selectedDataSource?: string;
  dataSourceConfig?: Record<string, any>;
}

const steps = [
  {
    id: 1,
    title: "Profile",
    description: "Tell us about yourself",
    icon: Icons.user,
  },
  {
    id: 2,
    title: "Organization",
    description: "Your company details",
    icon: Icons.building,
  },
  {
    id: 3,
    title: "First Connection",
    description: "Connect your data source",
    icon: Icons.database,
  },
];

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [tenantId, setTenantId] = useState<number | null>(null);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [formData, setFormData] = useState<OnboardingData>({
    first_name: "",
    middle_name: "",
    last_name: "",
    country_code: "63",
    phone_number: "",
    organization_name: "",
    industry: "",
    organization_size: "",
    website: "",
    description: "",
    primary_use_case: "",
  });

  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userResult = await getUser();
        console.log("userResult", userResult);

        if (userResult.status !== "success" || !userResult.response?.data) return;

        const userData = userResult.response.data;
        setFormData(prev => ({
          ...prev,
          first_name: userData.first_name || "",
          middle_name: userData.middle_name || "",
          last_name: userData.last_name || "",
          country_code: userData.country_code?.toString() || "63",
          phone_number: userData.phone_number || "",
        }));

        if (!userData.tenant_id) return;

        setTenantId(userData.tenant_id);
        const tenantResult = await getTenant(userData.tenant_id);
        console.log("tenantResult", tenantResult);

        if (tenantResult.status !== "success" || !tenantResult.response?.data) return;

        const tenantData = tenantResult.response.data;
        setFormData(prev => ({
          ...prev,
          organization_name: tenantData.name || "",
          industry: tenantData.industry || "",
          organization_size: tenantData.organization_size || "",
          website: tenantData.website || "",
          description: tenantData.description || "",
          primary_use_case: tenantData.primary_use_case || "",
        }));
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setIsLoadingUser(false);
      }
    };

    fetchUserData();
  }, []);

  const handleInputChange = (
    field: keyof OnboardingData,
    value: string
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleNext = async () => {
    if (currentStep < steps.length) {
      try {
        let result: ActionResult;
        switch (currentStep) {
          case 1:
            result = await updateProfile(formData);
            break;
          case 2:
            const organizationData = {
              name: formData.organization_name, // Map organization_name to name
              website: formData.website,
              industry: formData.industry,
              organization_size: formData.organization_size,
              description: formData.description,
              primary_use_case: formData.primary_use_case
            };
            result = await updateTenant(organizationData);
            break;
          default:
            throw new Error("Invalid step");
        }
        if (result.success) {
          setCurrentStep(currentStep + 1);
        } else {
          setErrors(result.errors || {});  // Provide a default empty object if errors is undefined
          toast({
            title: "Error",
            description: result.message || "An unexpected error occurred. Please try again.",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error(error);
      }
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkipDataSource = () => {
    handleComplete();
  };

  const handleComplete = async () => {
    setIsLoading(true);

    // Simulate API call to save onboarding data
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "Welcome aboard! 🎉",
        description:
          "Your account has been set up successfully.",
      });
      router.push("/dashboard/chat");
    }, 2000);
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return (
          formData.first_name.trim() &&
          formData.last_name.trim()
        );
      case 2:
        return (
          formData.organization_name.trim() &&
          formData.industry &&
          formData.organization_size
        );
      case 3:
        return true; // Step 3 is optional, user can skip
      default:
        return false;
    }
  };

  const progress = (currentStep / steps.length) * 100;
  const currentStepData = steps[currentStep - 1];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-black to-slate-900">

      <div className="relative z-10 container mx-auto px-4 py-8">
        <OnboardingHeader
          currentStep={currentStep}
          steps={steps}
          progress={progress}
        />

        <div className="max-w-4xl mx-auto">
          <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-violet-800 rounded-lg flex items-center justify-center">
                  {currentStepData.icon && (
                    <currentStepData.icon className="w-5 h-5 text-white" />
                  )}
                </div>
                <div>
                  <CardTitle className="text-white">
                    {currentStepData.title}
                  </CardTitle>
                  <CardDescription className="text-slate-400">
                    {currentStepData.description}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Step 1: Profile */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  {/* <div className="flex items-center gap-6">
                    <Avatar className="w-20 h-20">
                      <AvatarImage
                        src={
                          formData.avatar ||
                          "/placeholder.svg"
                        }
                        alt="Profile"
                      />
                      <AvatarFallback className="text-lg bg-slate-700">
                        {formData
                          .first_name[0] ||
                          "U"}
                        {formData
                          .last_name[0] ||
                          ""}
                      </AvatarFallback>
                    </Avatar>
                    <div className="space-y-2">
                      <Button
                        variant="outline"
                        className="bg-transparent border-slate-600 text-slate-200"
                      >
                        <Icons.upload className="w-4 h-4 mr-2" />
                        Upload Photo
                      </Button>
                      <p className="text-xs text-slate-500">
                        JPG, PNG or GIF. Max
                        size 2MB.
                      </p>
                    </div>
                  </div> */}

                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-2">
                      <Label
                        htmlFor="first_name"
                        className="text-slate-200"
                      >
                        First Name <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="first_name"
                        value={
                          formData.first_name
                        }
                        onChange={(e) =>
                          handleInputChange(
                            "first_name",
                            e.target.value
                          )
                        }
                        className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
                        placeholder="John"
                        required
                      />
                      {errors.first_name && (
                        <p className="text-sm text-red-500">{errors.first_name[0]}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label
                        htmlFor="middle_name"
                        className="text-slate-200"
                      >
                        Middle Name
                      </Label>
                      <Input
                        id="middle_name"
                        value={
                          formData.middle_name
                        }
                        onChange={(e) =>
                          handleInputChange(
                            "middle_name",
                            e.target.value
                          )
                        }
                        className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
                        placeholder="John"
                        required
                      />
                      {errors.middle_name && (
                        <p className="text-sm text-red-500">{errors.middle_name[0]}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label
                        htmlFor="last_name"
                        className="text-slate-200"
                      >
                        Last Name <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="last_name"
                        value={
                          formData.last_name
                        }
                        onChange={(e) =>
                          handleInputChange(
                            "last_name",
                            e.target.value
                          )
                        }
                        className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
                        placeholder="Doe"
                        required
                      />
                      {errors.last_name && (
                        <p className="text-sm text-red-500">{errors.last_name[0]}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-6">
                    <div className="space-y-2">
                      <Label
                        htmlFor="country_code"
                        className="text-slate-200"
                      >
                        Country Code
                      </Label>
                      <Input
                        id="country_code"
                        disabled
                        value={formData.country_code}
                        onChange={(e) =>
                          handleInputChange(
                            "country_code",
                            e.target.value
                          )
                        }
                        className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
                        placeholder="+1"
                      />
                      {errors.country_code && (
                        <p className="text-sm text-red-500">{errors.country_code[0]}</p>
                      )}
                    </div>
                    <div className="space-y-2 col-span-5">
                      <Label
                        htmlFor="phone_number"
                        className="text-slate-200"
                      >
                        Phone Number
                      </Label>
                      <Input
                        id="phone_number"
                        value={formData.phone_number}
                        onChange={(e) =>
                          handleInputChange(
                            "phone_number",
                            e.target.value
                          )
                        }
                        className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
                        placeholder="9213981253"
                      />
                      {errors.phone_number && (
                        <p className="text-sm text-red-500">{errors.phone_number[0]}</p>
                      )}
                    </div>
                  </div>


                </div>
              )}

              {/* Step 2: Organization */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label
                      htmlFor="organization_name"
                      className="text-slate-200"
                    >
                      Organization Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="organization_name"
                      value={
                        formData.organization_name
                      }
                      onChange={(e) =>
                        handleInputChange(
                          "organization_name",
                          e.target.value
                        )
                      }
                      className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
                      placeholder="Acme Corporation"
                      required
                    />
                    {errors.organization_name && (
                      <p className="text-sm text-red-500">{errors.organization_name[0]}</p>
                    )}
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label
                        htmlFor="industry"
                        className="text-slate-200"
                      >
                        Industry <span className="text-red-500">*</span>
                      </Label>
                      <Select
                        value={formData.industry}
                        onValueChange={(value) => handleInputChange("industry", value)}
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
                          <SelectItem value="consulting">
                            Consulting
                          </SelectItem>
                          <SelectItem value="other">
                            Other
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.industry && (
                        <p className="text-sm text-red-500">{errors.industry[0]}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label
                        htmlFor="organization_size"
                        className="text-slate-200"
                      >
                        Organization Size <span className="text-red-500">*</span>
                      </Label>
                      <Select
                        value={formData.organization_size}
                        onValueChange={(value) => handleInputChange("organization_size", value)}
                      >
                        <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white">
                          <SelectValue placeholder="Select organization size" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800 border-slate-700">
                          <SelectItem value="1-10">
                            1-10 employees
                          </SelectItem>
                          <SelectItem value="11-50">
                            11-50
                            employees
                          </SelectItem>
                          <SelectItem value="51-200">
                            51-200
                            employees
                          </SelectItem>
                          <SelectItem value="201-1000">
                            201-1000
                            employees
                          </SelectItem>
                          <SelectItem value="1000+">
                            1000+
                            employees
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.organization_size && (
                        <p className="text-sm text-red-500">{errors.organization_size[0]}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="website"
                      className="text-slate-200"
                    >
                      Website
                    </Label>
                    <Input
                      id="website"
                      type="url"
                      value={formData.website}
                      onChange={(e) =>
                        handleInputChange(
                          "website",
                          e.target.value
                        )
                      }
                      className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
                      placeholder="https://acme.com"
                    />
                    {errors.website && (
                      <p className="text-sm text-red-500">{errors.website[0]}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="primary_use_case"
                      className="text-slate-200"
                    >
                      Primary Use Case
                    </Label>
                    <Select
                      value={formData.primary_use_case}
                      onValueChange={(value) =>
                        handleInputChange(
                          "primary_use_case",
                          value
                        )
                      }
                    >
                      <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white">
                        <SelectValue placeholder="What will you primarily use AI Assistant for?" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700">
                        <SelectItem value="analytics">
                          Business Analytics
                          & Reporting
                        </SelectItem>
                        <SelectItem value="insights">
                          Data Insights &
                          Intelligence
                        </SelectItem>
                        <SelectItem value="automation">
                          Process Automation
                        </SelectItem>
                        <SelectItem value="forecasting">
                          Forecasting &
                          Predictions
                        </SelectItem>
                        <SelectItem value="customer">
                          Customer Analysis
                        </SelectItem>
                        <SelectItem value="operations">
                          Operations
                          Optimization
                        </SelectItem>
                        <SelectItem value="other">
                          Other
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.primary_use_case && (
                      <p className="text-sm text-red-500">{errors.primary_use_case[0]}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="description"
                      className="text-slate-200"
                    >
                      Organization Description
                    </Label>
                    <Textarea
                      id="description"
                      value={
                        formData.description
                      }
                      onChange={(e) =>
                        handleInputChange(
                          "description",
                          e.target.value
                        )
                      }
                      className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
                      placeholder="Brief description of your organization and what you do..."
                      rows={3}
                    />
                    {errors.description && (
                      <p className="text-sm text-red-500">{errors.description[0]}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Step 3: First Data Source Connection */}
              {currentStep === 3 && (
                <DataSourceSelector
                  selectedSource={
                    formData.selectedDataSource
                  }
                  onSourceSelect={(sourceId) =>
                    handleInputChange(
                      "selectedDataSource",
                      sourceId
                    )
                  }
                  onSkip={handleSkipDataSource}
                />
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between pt-6">
                <Button
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={currentStep === 1}
                  className="bg-transparent border-slate-600 text-slate-200 hover:bg-slate-700"
                >
                  <Icons.arrowLeft className="w-4 h-4 mr-2" />
                  Previous
                </Button>

                {currentStep < steps.length ? (
                  <Button
                    onClick={handleNext}
                    disabled={!isStepValid()}
                    className="bg-violet-600 text-white hover:bg-violet-800"
                  >
                    Next
                    <Icons.arrowRight className="w-4 h-4 ml-2" />
                  </Button>
                ) : (
                  <Button
                    onClick={handleComplete}
                    disabled={isLoading}
                    className="bg-violet-600 text-white hover:bg-violet-800"
                  >
                    {isLoading && (
                      <Icons.spinner className="w-4 h-4 mr-2 animate-spin" />
                    )}
                    Complete Setup
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
