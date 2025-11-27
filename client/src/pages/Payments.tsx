import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, Download, Eye } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";

export default function Payments() {
  const { isAuthenticated } = useAuth();
  const [selectedDeliverable, setSelectedDeliverable] = useState<any>(null);

  const { data: paymentRequests } = trpc.payments.getUserRequests.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );

  const { data: deliverables } = trpc.deliverables.getUserDeliverables.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Sign in required</h1>
          <p className="text-muted-foreground mb-8">
            Please sign in to view your payments and deliverables.
          </p>
          <Link href="/">
            <Button className="cyber-button">Back to Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="container py-6">
          <Link href="/">
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </Link>
          <h1 className="text-3xl font-bold gradient-text">My Payments & Deliverables</h1>
          <p className="text-muted-foreground mt-2">
            Track your payment requests and access your purchased courses and APIs
          </p>
        </div>
      </div>

      <div className="container py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Payment Requests Section */}
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Payment Requests</h2>
                <Link href="/payment-request">
                  <Button className="cyber-button">
                    New Request
                  </Button>
                </Link>
              </div>

              {paymentRequests && paymentRequests.length > 0 ? (
                <div className="space-y-4">
                  {paymentRequests.map((request) => (
                    <Card key={request.id} className="cyber-card p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-lg font-bold">
                            Request #{request.id}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {new Date(request.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <span
                          className={`text-xs font-bold px-3 py-1 rounded-full ${
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

                      <div className="space-y-3 mb-4">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Amount:</span>
                          <span className="font-bold text-accent">
                            ${(request.amount / 100).toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Transaction ID:
                          </span>
                          <span className="font-mono text-sm">
                            {request.transactionId}
                          </span>
                        </div>
                        {request.notes && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Notes:</span>
                            <span className="text-sm">{request.notes}</span>
                          </div>
                        )}
                      </div>

                      {request.status === "pending" && (
                        <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded text-sm text-yellow-700 dark:text-yellow-400">
                          Your payment is being verified by the admin. Please wait for approval.
                        </div>
                      )}

                      {request.status === "approved" && (
                        <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded text-sm text-blue-700 dark:text-blue-400">
                          Payment approved! Your course/API access will be delivered shortly.
                        </div>
                      )}

                      {request.status === "delivered" && (
                        <div className="p-3 bg-green-500/10 border border-green-500/30 rounded text-sm text-green-700 dark:text-green-400">
                          ✓ Delivered! Check the deliverables section below for access details.
                        </div>
                      )}

                      {request.status === "rejected" && (
                        <div className="p-3 bg-red-500/10 border border-red-500/30 rounded text-sm text-red-700 dark:text-red-400">
                          This payment request was rejected. {request.notes && `Reason: ${request.notes}`}
                        </div>
                      )}
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="cyber-card p-12 text-center">
                  <p className="text-muted-foreground mb-6">
                    No payment requests yet. Start by purchasing a course or API.
                  </p>
                  <Link href="/payment-request">
                    <Button className="cyber-button">
                      Submit Payment Request
                    </Button>
                  </Link>
                </Card>
              )}
            </div>

            {/* Deliverables Section */}
            {deliverables && deliverables.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold mb-6">Your Deliverables</h2>
                <div className="space-y-4">
                  {deliverables.map((deliverable) => (
                    <Card
                      key={deliverable.id}
                      className="cyber-card p-6 cursor-pointer hover:border-accent transition-all"
                      onClick={() => setSelectedDeliverable(deliverable)}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="text-lg font-bold mb-2">
                            {deliverable.deliveryType.toUpperCase()} Access
                          </h3>
                          <p className="text-sm text-muted-foreground mb-4">
                            Delivered on{" "}
                            {new Date(deliverable.createdAt).toLocaleDateString()}
                          </p>

                          {deliverable.accessLink && (
                            <div className="mb-3">
                              <p className="text-xs text-muted-foreground mb-1">
                                Access Link:
                              </p>
                              <a
                                href={deliverable.accessLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-accent hover:underline text-sm break-all"
                              >
                                {deliverable.accessLink}
                              </a>
                            </div>
                          )}

                          {deliverable.apiKey && (
                            <div className="mb-3">
                              <p className="text-xs text-muted-foreground mb-1">
                                API Key:
                              </p>
                              <code className="bg-background p-2 rounded text-xs font-mono break-all">
                                {deliverable.apiKey}
                              </code>
                            </div>
                          )}

                          {deliverable.expiresAt && (
                            <p className="text-xs text-muted-foreground">
                              Expires:{" "}
                              {new Date(deliverable.expiresAt).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedDeliverable(deliverable);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar - Quick Stats */}
          <div>
            <Card className="cyber-card sticky top-4">
              <h3 className="text-xl font-bold mb-6 gradient-text">Summary</h3>

              <div className="space-y-6">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">
                    Total Requests
                  </p>
                  <p className="text-3xl font-bold text-accent">
                    {paymentRequests?.length || 0}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground mb-2">
                    Pending
                  </p>
                  <p className="text-2xl font-bold text-yellow-500">
                    {paymentRequests?.filter((r) => r.status === "pending").length || 0}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground mb-2">
                    Delivered
                  </p>
                  <p className="text-2xl font-bold text-green-500">
                    {deliverables?.length || 0}
                  </p>
                </div>

                <div className="pt-6 border-t border-border">
                  <Link href="/payment-request">
                    <Button className="w-full cyber-button">
                      New Payment Request
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Deliverable Details Modal */}
      {selectedDeliverable && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedDeliverable(null)}
        >
          <Card
            className="cyber-card max-w-2xl w-full p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-bold mb-6 gradient-text">
              {selectedDeliverable.deliveryType.toUpperCase()} Details
            </h2>

            <div className="space-y-6 mb-8">
              {selectedDeliverable.accessLink && (
                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Access Link
                  </label>
                  <a
                    href={selectedDeliverable.accessLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-accent hover:underline break-all"
                  >
                    {selectedDeliverable.accessLink}
                  </a>
                </div>
              )}

              {selectedDeliverable.apiKey && (
                <div>
                  <label className="block text-sm font-semibold mb-2">
                    API Key
                  </label>
                  <code className="bg-background p-3 rounded block font-mono text-accent break-all">
                    {selectedDeliverable.apiKey}
                  </code>
                </div>
              )}

              {selectedDeliverable.credentials && (
                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Credentials
                  </label>
                  <pre className="bg-background p-3 rounded overflow-auto text-sm">
                    {selectedDeliverable.credentials}
                  </pre>
                </div>
              )}

              {selectedDeliverable.expiresAt && (
                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Expiration Date
                  </label>
                  <p>
                    {new Date(selectedDeliverable.expiresAt).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>

            <Button
              onClick={() => setSelectedDeliverable(null)}
              className="w-full cyber-button"
            >
              Close
            </Button>
          </Card>
        </div>
      )}
    </div>
  );
}
