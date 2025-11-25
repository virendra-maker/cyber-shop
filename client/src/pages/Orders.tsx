import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Package, ArrowLeft } from "lucide-react";
import { Link } from "wouter";

export default function Orders() {
  const { isAuthenticated } = useAuth();
  const { data: orders } = trpc.orders.list.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center">
          <Package className="h-16 w-16 text-accent mx-auto mb-4" />
          <h1 className="text-3xl font-bold mb-4">Sign in to view orders</h1>
          <p className="text-muted-foreground mb-8">
            Please sign in to access your order history.
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
          <h1 className="text-3xl font-bold gradient-text">Order History</h1>
        </div>
      </div>

      <div className="container py-12">
        {orders && orders.length > 0 ? (
          <div className="space-y-6">
            {orders.map((order) => (
              <Card key={order.id} className="cyber-card">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold">
                      Order #{order.id}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right mt-4 md:mt-0">
                    <p className="text-2xl font-bold text-accent">
                      ${(order.totalAmount / 100).toFixed(2)}
                    </p>
                    <p
                      className={`text-sm font-semibold ${
                        order.status === "completed"
                          ? "text-green-500"
                          : order.status === "pending"
                          ? "text-yellow-500"
                          : "text-red-500"
                      }`}
                    >
                      {order.status.charAt(0).toUpperCase() +
                        order.status.slice(1)}
                    </p>
                  </div>
                </div>

                {order.items && (
                  <div className="border-t border-border pt-4">
                    <h4 className="font-semibold mb-3">Items:</h4>
                    <div className="space-y-2">
                      {typeof order.items === "string" &&
                        JSON.parse(order.items).map(
                          (item: any, idx: number) => (
                            <div
                              key={idx}
                              className="text-sm text-muted-foreground"
                            >
                              Product ID: {item.productId} - Quantity:{" "}
                              {item.quantity}
                            </div>
                          )
                        )}
                    </div>
                  </div>
                )}
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">No orders yet</h2>
            <p className="text-muted-foreground mb-6">
              Start shopping to place your first order.
            </p>
            <Link href="/">
              <Button className="cyber-button">Continue Shopping</Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
