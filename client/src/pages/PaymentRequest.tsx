import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { AlertCircle, CheckCircle, Clock, Copy } from "lucide-react";
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
    if (!productId || !transactionId) {
      toast.error("Please fill in all fields");
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

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="container py-6">
          <h1 className="text-3xl font-bold gradient-text">Payment Request</h1>
          <p className="text-muted-foreground mt-2">
            Submit payment for courses, APIs, and services
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
                        className="cyber-card p-6 cursor-pointer hover:border-accent transition-all"
                        onClick={() => handleSelectProduct(product)}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h3 className="text-lg font-bold mb-2">
                              {product.name}
                            </h3>
                            <p className="text-sm text-muted-foreground mb-4">
                              {product.description}
                            </p>
                            <div className="flex gap-4">
                              <span className="text-sm">
                                Stock: <span className="font-semibold">{product.stock}</span>
                              </span>
                              <span className="text-sm">
                                Category ID: <span className="font-semibold">{product.categoryId}</span>
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-3xl font-bold text-accent">
                              ${(product.price / 100).toFixed(2)}
                            </p>
                            <Button size="sm" className="cyber-button mt-4">
                              Select
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))
                  ) : (
                    <p className="text-muted-foreground text-center py-12">
                      No products available
                    </p>
                  )}
                </div>
              </div>
            )}

            {step === "payment" && (
              <div>
                <h2 className="text-2xl font-bold mb-6">Payment Details</h2>
                <Card className="cyber-card p-8">
                  <div className="mb-8 p-6 bg-accent/10 border border-accent/30 rounded-lg">
                    <h3 className="font-bold text-lg mb-4 text-accent">
                      UPI Payment Information
                    </h3>
                    {adminSettings ? (
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm text-muted-foreground mb-2">
                            UPI ID
                          </p>
                          <div className="flex items-center gap-2">
                            <code className="bg-background p-3 rounded flex-1 font-mono text-accent">
                              {adminSettings.upiId}
                            </code>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                navigator.clipboard.writeText(
                                  adminSettings.upiId
                                );
                                toast.success("Copied to clipboard!");
                              }}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        {adminSettings.upiName && (
                          <div>
                            <p className="text-sm text-muted-foreground mb-2">
                              Name
                            </p>
                            <p className="font-semibold">
                              {adminSettings.upiName}
                            </p>
                          </div>
                        )}
                        {adminSettings.phoneNumber && (
                          <div>
                            <p className="text-sm text-muted-foreground mb-2">
                              Phone
                            </p>
                            <p className="font-semibold">
                              {adminSettings.phoneNumber}
                            </p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-muted-foreground">
                        Loading payment details...
                      </p>
                    )}
                  </div>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-semibold mb-2">
                        Amount to Pay
                      </label>
                      <div className="text-3xl font-bold text-accent">
                        ${(amount / 100).toFixed(2)}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold mb-2">
                        Transaction ID / UTR Number
                      </label>
                      <Input
                        placeholder="Enter UTR or Transaction ID from your bank"
                        value={transactionId}
                        onChange={(e) => setTransactionId(e.target.value)}
                        className="bg-input border-border"
                      />
                      <p className="text-xs text-muted-foreground mt-2">
                        You can find this in your bank app or payment confirmation
                      </p>
                    </div>

                    <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                      <p className="text-sm text-yellow-700 dark:text-yellow-400">
                        <strong>Important:</strong> After making the payment via UPI, enter the
                        transaction ID above. The admin will verify and deliver your course/API
                        access.
                      </p>
                    </div>

                    <div className="flex gap-4">
                      <Button
                        variant="outline"
                        onClick={() => setStep("select")}
                        className="flex-1"
                      >
                        Back
                      </Button>
                      <Button
                        onClick={handleSubmitPayment}
                        className="flex-1 cyber-button"
                        disabled={submitPaymentMutation.isPending}
                      >
                        {submitPaymentMutation.isPending
                          ? "Submitting..."
                          : "Submit Payment Request"}
                      </Button>
                    </div>
                  </div>
                </Card>
              </div>
            )}

            {step === "success" && (
              <div className="text-center">
                <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-6" />
                <h2 className="text-3xl font-bold mb-4">Payment Request Submitted!</h2>
                <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                  Your payment request has been submitted successfully. The admin will review and
                  deliver your course/API access shortly.
                </p>
                <Button
                  onClick={() => setLocation("/payments")}
                  className="cyber-button"
                >
                  View My Requests
                </Button>
              </div>
            )}
          </div>

          {/* Sidebar - Payment Status */}
          <div>
            <Card className="cyber-card sticky top-4">
              <h3 className="text-xl font-bold mb-6 gradient-text">
                Your Payment Requests
              </h3>

              {userRequests && userRequests.length > 0 ? (
                <div className="space-y-4">
                  {userRequests.map((request) => (
                    <div
                      key={request.id}
                      className="p-4 border border-border rounded-lg"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <span className="font-semibold">
                          Request #{request.id}
                        </span>
                        <span
                          className={`text-xs font-bold px-2 py-1 rounded ${
                            request.status === "pending"
                              ? "bg-yellow-500/20 text-yellow-700 dark:text-yellow-400"
                              : request.status === "approved"
                              ? "bg-blue-500/20 text-blue-700 dark:text-blue-400"
                              : request.status === "delivered"
                              ? "bg-green-500/20 text-green-700 dark:text-green-400"
                              : "bg-red-500/20 text-red-700 dark:text-red-400"
                          }`}
                        >
                          {request.status.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        ${(request.amount / 100).toFixed(2)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(request.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  No payment requests yet
                </p>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
