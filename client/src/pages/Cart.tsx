import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { Trash2, ShoppingCart, ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "wouter";

export default function Cart() {
  const { isAuthenticated } = useAuth();
  const [cartTotal, setCartTotal] = useState(0);

  const { data: cartItems, refetch: refetchCart } = trpc.cart.get.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );

  const { data: allProducts } = trpc.products.list.useQuery({});
  const removeFromCartMutation = trpc.cart.remove.useMutation();
  const createOrderMutation = trpc.orders.create.useMutation();

  // Calculate cart total
  useEffect(() => {
    if (cartItems && allProducts) {
      const total = cartItems.reduce((sum, item) => {
        const product = allProducts.find((p) => p.id === item.productId);
        return sum + (product?.price || 0) * item.quantity;
      }, 0);
      setCartTotal(total);
    }
  }, [cartItems, allProducts]);

  const handleRemoveItem = (productId: number) => {
    removeFromCartMutation.mutate(productId, {
      onSuccess: () => refetchCart(),
    });
  };

  const handleCheckout = async () => {
    if (!cartItems || cartItems.length === 0) return;

    const orderItems = cartItems.map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
    }));

    createOrderMutation.mutate(
      {
        totalAmount: cartTotal,
        items: orderItems,
      },
      {
        onSuccess: () => {
          // Clear cart and redirect
          trpc.cart.clear.useMutation().mutate(undefined, {
            onSuccess: () => {
              window.location.href = "/orders";
            },
          });
        },
      }
    );
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center">
          <ShoppingCart className="h-16 w-16 text-accent mx-auto mb-4" />
          <h1 className="text-3xl font-bold mb-4">Sign in to view cart</h1>
          <p className="text-muted-foreground mb-8">
            Please sign in to access your shopping cart.
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
              Back to Shopping
            </Button>
          </Link>
          <h1 className="text-3xl font-bold gradient-text">Shopping Cart</h1>
        </div>
      </div>

      <div className="container py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            {cartItems && cartItems.length > 0 ? (
              <div className="space-y-4">
                {cartItems.map((item) => {
                  const product = allProducts?.find(
                    (p) => p.id === item.productId
                  );
                  if (!product) return null;

                  return (
                    <Card key={item.id} className="cyber-card p-6">
                      <div className="flex gap-6">
                        {product.image && (
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-24 h-24 object-cover rounded"
                          />
                        )}
                        <div className="flex-1">
                          <h3 className="text-lg font-bold mb-2">
                            {product.name}
                          </h3>
                          <p className="text-sm text-muted-foreground mb-4">
                            {product.description}
                          </p>
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm text-muted-foreground">
                                Price: ${(product.price / 100).toFixed(2)}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                Quantity: {item.quantity}
                              </p>
                              <p className="text-lg font-bold text-accent">
                                ${(
                                  (product.price * item.quantity) /
                                  100
                                ).toFixed(2)}
                              </p>
                            </div>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleRemoveItem(product.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <ShoppingCart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
                <p className="text-muted-foreground mb-6">
                  Add some tools and services to get started.
                </p>
                <Link href="/">
                  <Button className="cyber-button">Continue Shopping</Button>
                </Link>
              </div>
            )}
          </div>

          {/* Cart Summary */}
          {cartItems && cartItems.length > 0 && (
            <div className="lg:col-span-1">
              <Card className="cyber-card sticky top-4">
                <h2 className="text-2xl font-bold mb-6 gradient-text">
                  Order Summary
                </h2>

                <div className="space-y-4 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal:</span>
                    <span>${(cartTotal / 100).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Shipping:</span>
                    <span>Free</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tax:</span>
                    <span>$0.00</span>
                  </div>
                  <div className="border-t border-border pt-4 flex justify-between font-bold text-lg">
                    <span>Total:</span>
                    <span className="text-accent">
                      ${(cartTotal / 100).toFixed(2)}
                    </span>
                  </div>
                </div>

                <Button
                  onClick={handleCheckout}
                  className="w-full cyber-button"
                  disabled={createOrderMutation.isPending}
                >
                  {createOrderMutation.isPending ? "Processing..." : "Proceed to Checkout"}
                </Button>

                <p className="text-xs text-muted-foreground text-center mt-4">
                  By checking out, you agree to our terms and conditions.
                </p>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
