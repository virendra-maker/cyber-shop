import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, Save, Upload, QrCode, Smartphone } from "lucide-react";
import React, { useState, useEffect } from "react";
import { Link } from "wouter";
import { toast } from "sonner";

export default function AdminSettings() {
  const { user, isAuthenticated } = useAuth();
  const [upiForm, setUpiForm] = useState({
    upiId: "",
    upiName: "",
    phoneNumber: "",
    bankAccount: "",
    qrCode: "",
  });
  const [qrCodePreview, setQrCodePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { data: adminSettings, isLoading: isLoadingSettings } = trpc.admin.settings.getAdmin.useQuery(
    undefined,
    { enabled: isAuthenticated && user?.role === "admin" }
  );

  const updateSettingsMutation = trpc.admin.settings.updateAdmin.useMutation();

  // Load settings when they arrive
  useEffect(() => {
    if (adminSettings) {
      setUpiForm({
        upiId: adminSettings.upiId || "",
        upiName: adminSettings.upiName || "",
        phoneNumber: adminSettings.phoneNumber || "",
        bankAccount: adminSettings.bankAccount || "",
        qrCode: adminSettings.qrCode || "",
      });
      if (adminSettings.qrCode) {
        setQrCodePreview(adminSettings.qrCode);
      }
    }
  }, [adminSettings]);

  if (!isAuthenticated || user?.role !== "admin") {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <Card className="cyber-card p-8 max-w-md">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="text-muted-foreground mb-6">
            Only admins can access this page.
          </p>
          <Link href="/admin">
            <Button className="w-full cyber-button">Back to Admin</Button>
          </Link>
        </Card>
      </div>
    );
  }

  const handleQrCodeUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        setQrCodePreview(dataUrl);
        setUpiForm({ ...upiForm, qrCode: dataUrl });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveSettings = async () => {
    if (!upiForm.upiId.trim()) {
      toast.error("UPI ID is required");
      return;
    }

    setIsLoading(true);
    updateSettingsMutation.mutate(
      {
        upiId: upiForm.upiId,
        upiName: upiForm.upiName || undefined,
        phoneNumber: upiForm.phoneNumber || undefined,
        bankAccount: upiForm.bankAccount || undefined,
        qrCode: upiForm.qrCode || undefined,
      },
      {
        onSuccess: () => {
          toast.success("Settings saved successfully!");
          setIsLoading(false);
        },
        onError: () => {
          toast.error("Failed to save settings");
          setIsLoading(false);
        },
      }
    );
  };

  if (isLoadingSettings) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <p className="text-muted-foreground">Loading settings...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="container py-6">
          <Link href="/admin">
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Admin
            </Button>
          </Link>
          <h1 className="text-3xl font-bold gradient-text">Payment Settings</h1>
          <p className="text-muted-foreground mt-2">
            Configure UPI details and QR code for payment collection
          </p>
        </div>
      </div>

      <div className="container py-12 max-w-2xl">
        <div className="space-y-8">
          {/* UPI Details Section */}
          <Card className="cyber-card p-8">
            <div className="flex items-center gap-2 mb-6">
              <Smartphone className="h-5 w-5 text-accent" />
              <h2 className="text-2xl font-bold">UPI Payment Details</h2>
            </div>

            <div className="space-y-6">
              {/* UPI ID */}
              <div>
                <label className="block text-sm font-semibold mb-2">
                  UPI ID *
                </label>
                <Input
                  placeholder="e.g., yourname@upi"
                  value={upiForm.upiId}
                  onChange={(e) => setUpiForm({ ...upiForm, upiId: e.target.value })}
                  className="bg-input border-border text-lg h-12"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  This UPI ID will be displayed to customers for payment
                </p>
              </div>

              {/* UPI Name */}
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Name (Optional)
                </label>
                <Input
                  placeholder="Your name or business name"
                  value={upiForm.upiName}
                  onChange={(e) => setUpiForm({ ...upiForm, upiName: e.target.value })}
                  className="bg-input border-border h-12"
                />
              </div>

              {/* Phone Number */}
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Phone Number (Optional)
                </label>
                <Input
                  placeholder="+91 98765 43210"
                  value={upiForm.phoneNumber}
                  onChange={(e) => setUpiForm({ ...upiForm, phoneNumber: e.target.value })}
                  className="bg-input border-border h-12"
                />
              </div>

              {/* Bank Account */}
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Bank Account (Optional)
                </label>
                <Input
                  placeholder="Account number or IFSC code"
                  value={upiForm.bankAccount}
                  onChange={(e) => setUpiForm({ ...upiForm, bankAccount: e.target.value })}
                  className="bg-input border-border h-12"
                />
              </div>
            </div>
          </Card>

          {/* QR Code Section */}
          <Card className="cyber-card p-8">
            <div className="flex items-center gap-2 mb-6">
              <QrCode className="h-5 w-5 text-accent" />
              <h2 className="text-2xl font-bold">UPI QR Code</h2>
            </div>

            <div className="space-y-6">
              {/* QR Code Preview */}
              <div>
                <label className="block text-sm font-semibold mb-4">
                  QR Code Preview
                </label>
                {qrCodePreview ? (
                  <div className="bg-white p-6 rounded-lg flex justify-center mb-4 border-2 border-border">
                    <img
                      src={qrCodePreview}
                      alt="UPI QR Code"
                      className="w-48 h-48 object-contain"
                    />
                  </div>
                ) : (
                  <div className="bg-card border-2 border-dashed border-border rounded-lg p-12 text-center mb-4">
                    <QrCode className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                    <p className="text-muted-foreground">No QR code uploaded yet</p>
                  </div>
                )}
              </div>

              {/* QR Code Upload */}
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Upload QR Code Image
                </label>
                <div className="flex gap-3">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleQrCodeUpload}
                    className="hidden"
                    id="qr-upload"
                  />
                  <label
                    htmlFor="qr-upload"
                    className="flex-1 flex items-center justify-center gap-2 bg-input border-2 border-dashed border-border rounded-lg p-4 cursor-pointer hover:border-accent transition-colors"
                  >
                    <Upload className="h-4 w-4" />
                    <span>Click to upload QR code image</span>
                  </label>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Supported formats: PNG, JPG, GIF. Max size: 5MB
                </p>
              </div>

              {/* Instructions */}
              <Card className="bg-card border border-border p-4">
                <h4 className="font-semibold mb-3">How to create a UPI QR Code:</h4>
                <ol className="space-y-2 text-sm text-muted-foreground list-decimal list-inside">
                  <li>Open your UPI app (Google Pay, PhonePe, BHIM, etc.)</li>
                  <li>Go to Settings or Profile</li>
                  <li>Look for "QR Code" or "My QR Code" option</li>
                  <li>Take a screenshot or save the QR code image</li>
                  <li>Upload the image here</li>
                </ol>
              </Card>
            </div>
          </Card>

          {/* Save Button */}
          <Button
            onClick={handleSaveSettings}
            className="w-full cyber-button py-6 text-lg"
            disabled={isLoading || updateSettingsMutation.isPending}
          >
            <Save className="h-4 w-4 mr-2" />
            {isLoading || updateSettingsMutation.isPending ? "Saving..." : "Save Settings"}
          </Button>

          {/* Info Box */}
          <Card className="bg-accent/10 border-accent p-6">
            <h4 className="font-semibold mb-2">💡 Important</h4>
            <ul className="space-y-2 text-sm text-muted-foreground list-disc list-inside">
              <li>Your UPI ID will be visible to all customers</li>
              <li>The QR code will be displayed on the payment page</li>
              <li>Customers will scan the QR code to make payments</li>
              <li>Update these settings regularly for security</li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}
