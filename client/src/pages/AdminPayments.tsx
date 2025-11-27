import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { CheckCircle, XCircle, Send, ArrowLeft } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function AdminPayments() {
  const { user, isAuthenticated } = useAuth();
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [deliveryForm, setDeliveryForm] = useState({
    accessLink: "",
    apiKey: "",
    credentials: "",
    deliveryType: "course" as "course" | "api" | "tool" | "service",
  });

  const { data: paymentRequests, refetch } = trpc.adminPayments.listAll.useQuery(
    undefined,
    { enabled: isAuthenticated && user?.role === "admin" }
  );

  const approveMutation = trpc.adminPayments.approve.useMutation();
  const rejectMutation = trpc.adminPayments.reject.useMutation();
  const deliverMutation = trpc.adminPayments.deliverContent.useMutation();

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

  const handleApprove = (requestId: number) => {
    approveMutation.mutate(
      { paymentRequestId: requestId },
      {
        onSuccess: () => {
          toast.success("Payment approved!");
          refetch();
        },
      }
    );
  };

  const handleReject = (requestId: number) => {
    rejectMutation.mutate(
      { paymentRequestId: requestId },
      {
        onSuccess: () => {
          toast.success("Payment rejected!");
          refetch();
        },
      }
    );
  };

  const handleDeliver = (requestId: number) => {
    deliverMutation.mutate(
      {
        paymentRequestId: requestId,
        deliveryType: deliveryForm.deliveryType,
        accessLink: deliveryForm.accessLink || undefined,
        apiKey: deliveryForm.apiKey || undefined,
        credentials: deliveryForm.credentials || undefined,
      },
      {
        onSuccess: () => {
          toast.success("Content delivered successfully!");
          setSelectedRequest(null);
          setDeliveryForm({
            accessLink: "",
            apiKey: "",
            credentials: "",
            deliveryType: "course",
          });
          refetch();
        },
      }
    );
  };

  const pendingRequests = paymentRequests?.filter((r) => r.status === "pending") || [];
  const approvedRequests = paymentRequests?.filter((r) => r.status === "approved") || [];
  const deliveredRequests = paymentRequests?.filter((r) => r.status === "delivered") || [];
  const rejectedRequests = paymentRequests?.filter((r) => r.status === "rejected") || [];

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
          <h1 className="text-3xl font-bold gradient-text">Payment Management</h1>
          <p className="text-muted-foreground mt-2">
            Review and approve payment requests, deliver courses and APIs
          </p>
        </div>
      </div>

      <div className="container py-12">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-12">
          <Card className="cyber-card p-6 text-center">
            <p className="text-sm text-muted-foreground mb-2">Pending</p>
            <p className="text-3xl font-bold text-yellow-500">
              {pendingRequests.length}
            </p>
          </Card>
          <Card className="cyber-card p-6 text-center">
            <p className="text-sm text-muted-foreground mb-2">Approved</p>
            <p className="text-3xl font-bold text-blue-500">
              {approvedRequests.length}
            </p>
          </Card>
          <Card className="cyber-card p-6 text-center">
            <p className="text-sm text-muted-foreground mb-2">Delivered</p>
            <p className="text-3xl font-bold text-green-500">
              {deliveredRequests.length}
            </p>
          </Card>
          <Card className="cyber-card p-6 text-center">
            <p className="text-sm text-muted-foreground mb-2">Rejected</p>
            <p className="text-3xl font-bold text-red-500">
              {rejectedRequests.length}
            </p>
          </Card>
        </div>

        {/* Pending Requests */}
        {pendingRequests.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6 gradient-text">
              Pending Requests ({pendingRequests.length})
            </h2>
            <div className="space-y-4">
              {pendingRequests.map((request) => (
                <Card key={request.id} className="cyber-card p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-bold">
                        Request #{request.id}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        User ID: {request.userId} | Product ID: {request.productId}
                      </p>
                    </div>
                    <span className="text-2xl font-bold text-accent">
                      ${(request.amount / 100).toFixed(2)}
                    </span>
                  </div>

                  <div className="mb-6 p-4 bg-background rounded">
                    <p className="text-sm text-muted-foreground mb-1">
                      Transaction ID:
                    </p>
                    <code className="font-mono text-accent">
                      {request.transactionId}
                    </code>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      onClick={() => handleApprove(request.id)}
                      className="flex-1 cyber-button"
                      disabled={approveMutation.isPending}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Approve
                    </Button>
                    <Button
                      onClick={() => handleReject(request.id)}
                      variant="destructive"
                      className="flex-1"
                      disabled={rejectMutation.isPending}
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Reject
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Approved Requests - Ready for Delivery */}
        {approvedRequests.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6 gradient-text">
              Approved - Ready for Delivery ({approvedRequests.length})
            </h2>
            <div className="space-y-4">
              {approvedRequests.map((request) => (
                <Card key={request.id} className="cyber-card p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-bold">
                        Request #{request.id}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        User ID: {request.userId} | Product ID: {request.productId}
                      </p>
                    </div>
                    <span className="text-2xl font-bold text-accent">
                      ${(request.amount / 100).toFixed(2)}
                    </span>
                  </div>

                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        className="w-full cyber-button"
                        onClick={() => setSelectedRequest(request)}
                      >
                        <Send className="h-4 w-4 mr-2" />
                        Deliver Content
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-card border-border">
                      <DialogHeader>
                        <DialogTitle>Deliver Course/API Access</DialogTitle>
                        <DialogDescription>
                          Provide access details for request #{request.id}
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-semibold mb-2">
                            Delivery Type
                          </label>
                          <select
                            value={deliveryForm.deliveryType}
                            onChange={(e) =>
                              setDeliveryForm({
                                ...deliveryForm,
                                deliveryType: e.target.value as any,
                              })
                            }
                            className="w-full bg-input border border-border rounded px-3 py-2"
                          >
                            <option value="course">Course</option>
                            <option value="api">API</option>
                            <option value="tool">Tool</option>
                            <option value="service">Service</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-semibold mb-2">
                            Access Link (optional)
                          </label>
                          <Input
                            placeholder="https://example.com/course"
                            value={deliveryForm.accessLink}
                            onChange={(e) =>
                              setDeliveryForm({
                                ...deliveryForm,
                                accessLink: e.target.value,
                              })
                            }
                            className="bg-input border-border"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold mb-2">
                            API Key (optional)
                          </label>
                          <Input
                            placeholder="sk_live_..."
                            value={deliveryForm.apiKey}
                            onChange={(e) =>
                              setDeliveryForm({
                                ...deliveryForm,
                                apiKey: e.target.value,
                              })
                            }
                            className="bg-input border-border"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold mb-2">
                            Credentials (JSON, optional)
                          </label>
                          <textarea
                            placeholder='{"username": "user", "password": "pass"}'
                            value={deliveryForm.credentials}
                            onChange={(e) =>
                              setDeliveryForm({
                                ...deliveryForm,
                                credentials: e.target.value,
                              })
                            }
                            className="w-full bg-input border border-border rounded px-3 py-2 font-mono text-sm"
                            rows={4}
                          />
                        </div>

                        <Button
                          onClick={() => handleDeliver(request.id)}
                          className="w-full cyber-button"
                          disabled={deliverMutation.isPending}
                        >
                          {deliverMutation.isPending
                            ? "Delivering..."
                            : "Deliver Content"}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Delivered Requests */}
        {deliveredRequests.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6 gradient-text">
              Delivered ({deliveredRequests.length})
            </h2>
            <div className="space-y-4">
              {deliveredRequests.map((request) => (
                <Card key={request.id} className="cyber-card p-6 opacity-75">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-bold">
                        Request #{request.id}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        User ID: {request.userId} | Product ID: {request.productId}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-2xl font-bold text-accent">
                        ${(request.amount / 100).toFixed(2)}
                      </span>
                      <p className="text-xs text-green-500 mt-2">✓ Delivered</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Rejected Requests */}
        {rejectedRequests.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold mb-6 gradient-text">
              Rejected ({rejectedRequests.length})
            </h2>
            <div className="space-y-4">
              {rejectedRequests.map((request) => (
                <Card key={request.id} className="cyber-card p-6 opacity-75">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-bold">
                        Request #{request.id}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        User ID: {request.userId} | Product ID: {request.productId}
                      </p>
                      {request.notes && (
                        <p className="text-sm text-red-500 mt-2">
                          Reason: {request.notes}
                        </p>
                      )}
                    </div>
                    <span className="text-2xl font-bold text-red-500">
                      ${(request.amount / 100).toFixed(2)}
                    </span>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {paymentRequests?.length === 0 && (
          <Card className="cyber-card p-12 text-center">
            <p className="text-muted-foreground text-lg">
              No payment requests yet.
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}
