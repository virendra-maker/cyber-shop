import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { getLoginUrl, APP_TITLE } from "@/const";
import { ShoppingCart, Shield, Zap, Lock, Search } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<number | undefined>();

  const { data: categories } = trpc.products.categories.useQuery();
  const { data: products } = trpc.products.list.useQuery({
    categoryId: selectedCategory,
    search: searchTerm || undefined,
  });

  const addToCartMutation = trpc.cart.add.useMutation();

  const handleAddToCart = (productId: number) => {
    if (!isAuthenticated) {
      window.location.href = getLoginUrl();
      return;
    }
    addToCartMutation.mutate({ productId, quantity: 1 });
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navigation */}
      <nav className="border-b border-border bg-card">
        <div className="container flex items-center justify-between py-4">
          <div className="flex items-center gap-2">
            <Shield className="h-8 w-8 text-accent" />
            <h1 className="text-2xl font-bold gradient-text">{APP_TITLE}</h1>
          </div>
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <span className="text-sm text-muted-foreground">
                  Welcome, {user?.name}
                </span>
                <Link href="/cart">
                  <Button variant="outline" size="sm">
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Cart
                  </Button>
                </Link>
                <Link href="/orders">
                  <Button variant="outline" size="sm">
                    Orders
                  </Button>
                </Link>
                {user?.role === "admin" && (
                  <Link href="/admin">
                    <Button size="sm" className="cyber-button">
                      Admin Panel
                    </Button>
                  </Link>
                )}
              </>
            ) : (
              <Button
                onClick={() => (window.location.href = getLoginUrl())}
                className="cyber-button"
              >
                Sign In
              </Button>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden border-b border-border">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-5xl font-bold mb-6 gradient-text">
                Cyber Tools & Services
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Your one-stop shop for professional hacking tools, security utilities, and penetration testing services. Everything you need for ethical hacking and cybersecurity.
              </p>
              <div className="flex gap-4">
                <Button size="lg" className="cyber-button">
                  Explore Tools
                </Button>
                <Button size="lg" variant="outline">
                  Learn More
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="cyber-card text-center">
                <Zap className="h-12 w-12 text-accent mx-auto mb-4" />
                <h3 className="font-bold mb-2">Fast Delivery</h3>
                <p className="text-sm text-muted-foreground">
                  Instant access to all tools
                </p>
              </div>
              <div className="cyber-card text-center">
                <Lock className="h-12 w-12 text-accent mx-auto mb-4" />
                <h3 className="font-bold mb-2">Secure</h3>
                <p className="text-sm text-muted-foreground">
                  Your data is encrypted
                </p>
              </div>
              <div className="cyber-card text-center">
                <Shield className="h-12 w-12 text-accent mx-auto mb-4" />
                <h3 className="font-bold mb-2">Verified</h3>
                <p className="text-sm text-muted-foreground">
                  All tools verified
                </p>
              </div>
              <div className="cyber-card text-center">
                <ShoppingCart className="h-12 w-12 text-accent mx-auto mb-4" />
                <h3 className="font-bold mb-2">Easy Checkout</h3>
                <p className="text-sm text-muted-foreground">
                  Simple payment process
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Search and Filter Section */}
      <section className="py-12 border-b border-border">
        <div className="container">
          <div className="flex flex-col gap-6">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search tools and services..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Category Filter */}
            {categories && categories.length > 0 && (
              <div className="flex gap-2 flex-wrap">
                <Button
                  variant={selectedCategory === undefined ? "default" : "outline"}
                  onClick={() => setSelectedCategory(undefined)}
                  size="sm"
                >
                  All Categories
                </Button>
                {categories.map((cat) => (
                  <Button
                    key={cat.id}
                    variant={selectedCategory === cat.id ? "default" : "outline"}
                    onClick={() => setSelectedCategory(cat.id)}
                    size="sm"
                  >
                    {cat.name}
                  </Button>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-16">
        <div className="container">
          <h2 className="text-3xl font-bold mb-12 gradient-text">
            Featured Products & Services
          </h2>

          {products && products.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <Link key={product.id} href={`/product/${product.id}`}>
                  <Card className="cyber-card h-full flex flex-col cursor-pointer">
                    {product.image && (
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-48 object-cover rounded-t-lg mb-4"
                      />
                    )}
                    <div className="flex-1 flex flex-col">
                      <h3 className="text-xl font-bold mb-2">
                        {product.name}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-4 flex-1">
                        {product.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-2xl font-bold text-accent">
                            ${(product.price / 100).toFixed(2)}
                          </p>
                          {product.originalPrice && (
                            <p className="text-sm text-muted-foreground line-through">
                              ${(product.originalPrice / 100).toFixed(2)}
                            </p>
                          )}
                        </div>
                        <Button
                          size="sm"
                          className="cyber-button"
                          onClick={(e) => {
                            e.preventDefault();
                            handleAddToCart(product.id);
                          }}
                        >
                          <ShoppingCart className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">
                No products found. Try adjusting your search or filters.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card py-12">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="font-bold mb-4 text-accent">About Us</h4>
              <p className="text-sm text-muted-foreground">
                Leading provider of cybersecurity tools and services for ethical hackers and security professionals.
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-4 text-accent">Quick Links</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="nav-link">
                    Home
                  </a>
                </li>
                <li>
                  <a href="#" className="nav-link">
                    Products
                  </a>
                </li>
                <li>
                  <a href="#" className="nav-link">
                    Services
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4 text-accent">Support</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="nav-link">
                    Help Center
                  </a>
                </li>
                <li>
                  <a href="#" className="nav-link">
                    Contact Us
                  </a>
                </li>
                <li>
                  <a href="#" className="nav-link">
                    FAQ
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4 text-accent">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="nav-link">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="nav-link">
                    Terms of Service
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; 2024 {APP_TITLE}. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
