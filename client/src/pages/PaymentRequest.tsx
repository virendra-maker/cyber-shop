import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { AlertCircle, CheckCircle, Clock, Copy, QrCode, Smartphone } from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";

export default function PaymentRequest() {
  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [productId, setProductId] = useState<number | null>(null);
  const [amount, setAmount] = useState<number>(0);
  const [transactionId, setTransactionId] = useState("");
  const [step, setStep] = useState<"select" | "payment" | "submit" | "success">("select");

  const { data: products } = trpc.products.list.useQuery({});
  const { data: adminSettings } = trpc.admin.settings.getPublicUPI.useQuery();
  const { data: userRequests } = trpc.payments.getUserRequests.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );

  const submitPaymentMutation = trpc.payments.submitRequest.useMutation();

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <Card className="cyber-card p-8 max-w-md">
          <AlertCircle className="h-12 w-12 text-accent mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-center mb-4">Sign In Required</h1>
          <p className="text-muted-foreground text-center mb-6">
            Please sign in to submit payment requests.
          </p>
          <Button
            onClick={() => setLocation("/")}
            className="w-full cyber-button"
          >
            Go to Home
          </Button>
        </Card>
      </div>
    );
  }

  const handleSelectProduct = (product: any) => {
    setProductId(product.id);
    setAmount(product.price);
    setStep("payment");
  };

  const handleSubmitPayment = async () => {
    if (!productId || !transactionId.trim()) {
      toast.error("Please enter Transaction ID / UTR number");
      return;
    }

    submitPaymentMutation.mutate(
      {
        productId,
        amount,
        transactionId,
        paymentMethod: "upi",
      },
      {
        onSuccess: () => {
          toast.success("Payment request submitted successfully!");
          setStep("success");
          setTimeout(() => {
            setLocation("/payments");
          }, 2000);
        },
        onError: (error) => {
          toast.error("Failed to submit payment request");
        },
      }
    );
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="container py-6">
          <h1 className="text-3xl font-bold gradient-text">UPI Payment</h1>
          <p className="text-muted-foreground mt-2">
            Pay via UPI and submit transaction ID to get instant access
          </p>
        </div>
      </div>

      <div className="container py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {step === "select" && (
              <div>
                <h2 className="text-2xl font-bold mb-6">Select a Product</h2>
                <div className="space-y-4">
                  {products && products.length > 0 ? (
                    products.map((product) => (
                      <Card
                        key={product.id}
                        className="cyber-card p-6 cursor-pointer hover:border-accent transition-colors"
                        onClick={() => handleSelectProduct(product)}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="text-lg font-bold">{product.name}</h3>
                            <p className="text-sm text-muted-foreground mt-1">
                              {product.description}
                            </p>
                          </div>
                          <span className="text-2xl font-bold text-accent">
                            ${(product.price / 100).toFixed(2)}
                          </span>
                        </div>
                      </Card>
                    ))
                  ) : (
                    <Card className="cyber-card p-12 text-center">
                      <p className="text-muted-foreground">No products available</p>
                    </Card>
                  )}
                </div>
              </div>
            )}

            {step === "payment" && (
              <div>
                <Button
                  variant="ghost"
                  onClick={() => setStep("select")}
                  className="mb-6"
                >
                  ← Back to Products
                </Button>

                <div className="space-y-6">
                  {/* QR Code Section */}
                  <Card className="cyber-card p-8">
                    <div className="flex items-center gap-2 mb-6">
                      <QrCode className="h-5 w-5 text-accent" />
                      <h3 className="text-xl font-bold">Scan QR Code</h3>
                    </div>

                    {adminSettings?.qrCode ? (
                      <div className="bg-white p-6 rounded-lg flex justify-center mb-6">
                        <img
                          src={adminSettings.qrCode}
                          alt="UPI QR Code"
                          className="w-64 h-64 object-contain"
                        />
                      </div>
                    ) : (
                      <div className="bg-card border-2 border-dashed border-border rounded-lg p-12 text-center mb-6">
                        <QrCode className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                        <p className="text-muted-foreground">QR Code not available</p>
                      </div>
                    )}

                    <p className="text-sm text-muted-foreground text-center">
                      Scan this QR code with your UPI app to make payment
                    </p>
                  </Card>

                  {/* UPI ID Section */}
                  <Card className="cyber-card p-8">
                    <div className="flex items-center gap-2 mb-6">
                      <Smartphone className="h-5 w-5 text-accent" />
                      <h3 className="text-xl font-bold">Or Pay Directly</h3>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-semibold mb-2">
                          UPI ID
                        </label>
                        <div className="flex gap-2">
                          <div className="flex-1 bg-input border border-border rounded-lg px-4 py-3 font-mono text-sm break-all">
                            {adminSettings?.upiId || "Not configured"}
                          </div>
                          {adminSettings?.upiId && (
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => copyToClipboard(adminSettings.upiId)}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold mb-2">
                          Amount to Pay
                        </label>
                        <div className="bg-input border border-border rounded-lg px-4 py-3 font-bold text-lg text-accent">
                          ₹{(amount / 100).toFixed(2)}
                        </div>
                      </div>

                      <p className="text-xs text-muted-foreground bg-card border border-border rounded p-3">
                        💡 Open your UPI app (Google Pay, PhonePe, BHIM, etc.) and send payment to the UPI ID above
                      </p>
                    </div>
                  </Card>

                  {/* Amount Display */}
                  <Card className="cyber-card p-6 bg-accent/10 border-accent">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold">Total Amount:</span>
                      <span className="text-3xl font-bold text-accent">
                        ₹{(amount / 100).toFixed(2)}
                      </span>
                    </div>
                  </Card>

                  {/* Next Step Button */}
                  <Button
                    onClick={() => setStep("submit")}
                    className="w-full cyber-button py-6 text-lg"
                  >
                    I've Completed Payment →
                  </Button>
                </div>
              </div>
            )}

            {step === "submit" && (
              <div>
                <Button
                  variant="ghost"
                  onClick={() => setStep("payment")}
                  className="mb-6"
                >
                  ← Back to Payment
                </Button>

                <Card className="cyber-card p-8">
                  <div className="mb-6">
                    <h3 className="text-2xl font-bold mb-2">Verify Payment</h3>
                    <p className="text-muted-foreground">
                      Enter your transaction ID or UTR number to complete the request
                    </p>
                  </div>

                  <div className="space-y-6">
                    {/* Transaction ID Input */}
                    <div>
                      <label className="block text-sm font-semibold mb-2">
                        Transaction ID / UTR Number *
                      </label>
                      <Input
                        placeholder="e.g., 123456789012 or UTR1234567890"
                        value={transactionId}
                        onChange={(e) => setTransactionId(e.target.value)}
                        className="bg-input border-border text-lg h-12"
                      />
                      <p className="text-xs text-muted-foreground mt-2">
                        You can find this in your UPI app transaction history
                      </p>
                    </div>

                    {/* Instructions */}
                    <Card className="bg-card border border-border p-4">
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <Clock className="h-4 w-4 text-accent" />
                        How to find Transaction ID:
                      </h4>
                      <ol className="space-y-2 text-sm text-muted-foreground list-decimal list-inside">
                        <li>Open your UPI app (Google Pay, PhonePe, BHIM, etc.)</li>
                        <li>Go to Transaction History or Recent Transactions</li>
                        <li>Find the payment you just made</li>
                        <li>Copy the Transaction ID or UTR number</li>
                        <li>Paste it above and submit</li>
                      </ol>
                    </Card>

                    {/* Amount Summary */}
                    <Card className="cyber-card p-6 bg-accent/10 border-accent">
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Amount Paid:</span>
                          <span className="font-bold text-accent">
                            ₹{(amount / 100).toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Status:</span>
                          <span className="font-bold text-yellow-500">Pending</span>
                        </div>
                      </div>
                    </Card>

                    {/* Submit Button */}
                    <Button
                      onClick={handleSubmitPayment}
                      className="w-full cyber-button py-6 text-lg"
                      disabled={submitPaymentMutation.isPending || !transactionId.trim()}
                    >
                      {submitPaymentMutation.isPending
                        ? "Submitting..."
                        : "Submit Payment Request"}
                    </Button>
                  </div>
                </Card>
              </div>
            )}

            {step === "success" && (
              <Card className="cyber-card p-8 text-center">
                <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold mb-2">Payment Request Submitted!</h2>
                <p className="text-muted-foreground mb-6">
                  Your payment request has been submitted successfully. The admin will verify and approve your payment shortly.
                </p>
                <p className="text-sm text-muted-foreground mb-6">
                  You will receive access details once the payment is approved.
                </p>
                <Button
                  onClick={() => setLocation("/payments")}
                  className="cyber-button"
                >
                  View My Payments
                </Button>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="cyber-card p-6 sticky top-6">
              <h3 className="text-lg font-bold mb-4">Payment Steps</h3>
              <div className="space-y-4">
                <div className={`flex gap-3 ${step === "select" ? "opacity-100" : "opacity-50"}`}>
                  <div className="flex-shrink-0 w-8 h-8 bg-accent rounded-full flex items-center justify-center text-black font-bold text-sm">
                    1
                  </div>
                  <div>
                    <p className="font-semibold">Select Product</p>
                    <p className="text-xs text-muted-foreground">Choose what to buy</p>
                  </div>
                </div>

                <div className={`flex gap-3 ${step === "payment" ? "opacity-100" : "opacity-50"}`}>
                  <div className="flex-shrink-0 w-8 h-8 bg-accent rounded-full flex items-center justify-center text-black font-bold text-sm">
                    2
                  </div>
                  <div>
                    <p className="font-semibold">Make Payment</p>
                    <p className="text-xs text-muted-foreground">Scan QR or use UPI ID</p>
                  </div>
                </div>

                <div className={`flex gap-3 ${step === "submit" ? "opacity-100" : "opacity-50"}`}>
                  <div className="flex-shrink-0 w-8 h-8 bg-accent rounded-full flex items-center justify-center text-black font-bold text-sm">
                    3
                  </div>
                  <div>
                    <p className="font-semibold">Submit Transaction ID</p>
                    <p className="text-xs text-muted-foreground">Enter UTR number</p>
                  </div>
                </div>

                <div className={`flex gap-3 ${step === "success" ? "opacity-100" : "opacity-50"}`}>
                  <div className="flex-shrink-0 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-black font-bold text-sm">
                    ✓
                  </div>
                  <div>
                    <p className="font-semibold">Admin Approval</p>
                    <p className="text-xs text-muted-foreground">Get access details</p>
                  </div>
                </div>
              </div>

              {/* Recent Requests */}
              {userRequests && userRequests.length > 0 && (
                <div className="mt-8 pt-6 border-t border-border">
                  <h4 className="font-semibold mb-3">Your Recent Requests</h4>
                  <div className="space-y-2">
                    {userRequests.slice(0, 3).map((req) => (
                      <div key={req.id} className="text-xs bg-card p-2 rounded">
                        <p className="font-semibold">₹{(req.amount / 100).toFixed(2)}</p>
                        <p className="text-muted-foreground">
                          Status: <span className="capitalize">{req.status}</span>
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
