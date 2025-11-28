import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { Plus, Edit, Trash2, ArrowLeft, Package, BarChart3 } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function AdminDashboard() {
  const { user, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState<"products" | "categories" | "orders" | "payments">("products");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [editingCategory, setEditingCategory] = useState<any>(null);

  // Form states
  const [productForm, setProductForm] = useState({
    name: "",
    description: "",
    price: 0,
    originalPrice: 0,
    image: "",
    stock: 0,
    categoryId: 0,
    features: "",
  });

  const [categoryForm, setCategoryForm] = useState({
    name: "",
    description: "",
    icon: "",
  });

  // Queries
  const { data: products, refetch: refetchProducts } = trpc.admin.products.list.useQuery(
    undefined,
    { enabled: isAuthenticated && user?.role === "admin" }
  );

  const { data: categories, refetch: refetchCategories } = trpc.admin.categories.list.useQuery(
    undefined,
    { enabled: isAuthenticated && user?.role === "admin" }
  );

  const { data: orders } = trpc.admin.orders.list.useQuery(
    undefined,
    { enabled: isAuthenticated && user?.role === "admin" }
  );

  // Mutations
  const upsertProductMutation = trpc.admin.products.upsert.useMutation();
  const deleteProductMutation = trpc.admin.products.delete.useMutation();
  const upsertCategoryMutation = trpc.admin.categories.upsert.useMutation();

  // Handlers
  const handleSaveProduct = async () => {
    upsertProductMutation.mutate(
      {
        id: editingProduct?.id,
        ...productForm,
        isActive: 1,
      },
      {
        onSuccess: () => {
          setIsDialogOpen(false);
          setEditingProduct(null);
          setProductForm({
            name: "",
            description: "",
            price: 0,
            originalPrice: 0,
            image: "",
            stock: 0,
            categoryId: 0,
            features: "",
          });
          refetchProducts();
        },
      }
    );
  };

  const handleDeleteProduct = (id: number) => {
    if (confirm("Are you sure you want to delete this product?")) {
      deleteProductMutation.mutate(id, {
        onSuccess: () => refetchProducts(),
      });
    }
  };

  const handleSaveCategory = async () => {
    upsertCategoryMutation.mutate(
      {
        id: editingCategory?.id,
        ...categoryForm,
      },
      {
        onSuccess: () => {
          setIsDialogOpen(false);
          setEditingCategory(null);
          setCategoryForm({
            name: "",
            description: "",
            icon: "",
          });
          refetchCategories();
        },
      }
    );
  };

  const handleEditProduct = (product: any) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      description: product.description || "",
      price: product.price,
      originalPrice: product.originalPrice || 0,
      image: product.image || "",
      stock: product.stock,
      categoryId: product.categoryId,
      features: product.features || "",
    });
    setIsDialogOpen(true);
  };

  const handleEditCategory = (category: any) => {
    setEditingCategory(category);
    setCategoryForm({
      name: category.name,
      description: category.description || "",
      icon: category.icon || "",
    });
    setIsDialogOpen(true);
  };

  if (!isAuthenticated || user?.role !== "admin") {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center">
          <Package className="h-16 w-16 text-accent mx-auto mb-4" />
          <h1 className="text-3xl font-bold mb-4">Access Denied</h1>
          <p className="text-muted-foreground mb-8">
            You need admin privileges to access this page.
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
              Back to Store
            </Button>
          </Link>
          <h1 className="text-3xl font-bold gradient-text">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-2">Manage products, categories, and orders</p>
        </div>
      </div>

      <div className="container py-12">
        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-border">
          <Button
            variant={activeTab === "products" ? "default" : "ghost"}
            onClick={() => setActiveTab("products")}
            className={activeTab === "products" ? "cyber-button" : ""}
          >
            <Package className="h-4 w-4 mr-2" />
            Products
          </Button>
          <Button
            variant={activeTab === "categories" ? "default" : "ghost"}
            onClick={() => setActiveTab("categories")}
            className={activeTab === "categories" ? "cyber-button" : ""}
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            Categories
          </Button>
          <Button
            variant={activeTab === "orders" ? "default" : "ghost"}
            onClick={() => setActiveTab("orders")}
            className={activeTab === "orders" ? "cyber-button" : ""}
          >
            Orders
          </Button>
          <Link href="/admin/payments">
            <Button
              variant="ghost"
              className="hover:bg-accent/10"
            >
              💳 Payments
            </Button>
          </Link>
          <Link href="/admin/settings">
            <Button
              variant="ghost"
              className="hover:bg-accent/10"
            >
              ⚙️ Settings
            </Button>
          </Link>
        </div>

        {/* Products Tab */}
        {activeTab === "products" && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Products</h2>
              <Dialog open={isDialogOpen && !editingCategory} onOpenChange={(open) => {
                if (!open) {
                  setEditingProduct(null);
                  setProductForm({
                    name: "",
                    description: "",
                    price: 0,
                    originalPrice: 0,
                    image: "",
                    stock: 0,
                    categoryId: 0,
                    features: "",
                  });
                }
                setIsDialogOpen(open);
              }}>
                <DialogTrigger asChild>
                  <Button className="cyber-button">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Product
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-card border-border">
                  <DialogHeader>
                    <DialogTitle>
                      {editingProduct ? "Edit Product" : "Add New Product"}
                    </DialogTitle>
                    <DialogDescription>
                      Fill in the product details below.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <Input
                      placeholder="Product Name"
                      value={productForm.name}
                      onChange={(e) =>
                        setProductForm({ ...productForm, name: e.target.value })
                      }
                    />
                    <Input
                      placeholder="Description"
                      value={productForm.description}
                      onChange={(e) =>
                        setProductForm({
                          ...productForm,
                          description: e.target.value,
                        })
                      }
                    />
                    <Input
                      type="number"
                      placeholder="Price (in cents)"
                      value={productForm.price}
                      onChange={(e) =>
                        setProductForm({
                          ...productForm,
                          price: parseInt(e.target.value),
                        })
                      }
                    />
                    <Input
                      type="number"
                      placeholder="Original Price (optional)"
                      value={productForm.originalPrice}
                      onChange={(e) =>
                        setProductForm({
                          ...productForm,
                          originalPrice: parseInt(e.target.value),
                        })
                      }
                    />
                    <Input
                      placeholder="Image URL"
                      value={productForm.image}
                      onChange={(e) =>
                        setProductForm({ ...productForm, image: e.target.value })
                      }
                    />
                    <Input
                      type="number"
                      placeholder="Stock"
                      value={productForm.stock}
                      onChange={(e) =>
                        setProductForm({
                          ...productForm,
                          stock: parseInt(e.target.value),
                        })
                      }
                    />
                    <Input
                      type="number"
                      placeholder="Category ID"
                      value={productForm.categoryId}
                      onChange={(e) =>
                        setProductForm({
                          ...productForm,
                          categoryId: parseInt(e.target.value),
                        })
                      }
                    />
                    <Input
                      placeholder="Features (JSON array)"
                      value={productForm.features}
                      onChange={(e) =>
                        setProductForm({
                          ...productForm,
                          features: e.target.value,
                        })
                      }
                    />
                    <Button
                      onClick={handleSaveProduct}
                      className="w-full cyber-button"
                      disabled={upsertProductMutation.isPending}
                    >
                      {upsertProductMutation.isPending ? "Saving..." : "Save Product"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="space-y-4">
              {products && products.length > 0 ? (
                products.map((product) => (
                  <Card key={product.id} className="cyber-card p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="text-lg font-bold mb-2">{product.name}</h3>
                        <p className="text-sm text-muted-foreground mb-2">
                          {product.description}
                        </p>
                        <div className="flex gap-4 text-sm">
                          <span>
                            Price: <span className="text-accent">${(product.price / 100).toFixed(2)}</span>
                          </span>
                          <span>
                            Stock: <span className="font-semibold">{product.stock}</span>
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditProduct(product)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeleteProduct(product.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  No products yet. Create one to get started.
                </p>
              )}
            </div>
          </div>
        )}

        {/* Categories Tab */}
        {activeTab === "categories" && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Categories</h2>
              <Dialog open={isDialogOpen && !!editingCategory} onOpenChange={(open) => {
                if (!open) {
                  setEditingCategory(null);
                  setCategoryForm({
                    name: "",
                    description: "",
                    icon: "",
                  });
                }
                setIsDialogOpen(open);
              }}>
                <DialogTrigger asChild>
                  <Button className="cyber-button">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Category
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-card border-border">
                  <DialogHeader>
                    <DialogTitle>
                      {editingCategory ? "Edit Category" : "Add New Category"}
                    </DialogTitle>
                    <DialogDescription>
                      Fill in the category details below.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <Input
                      placeholder="Category Name"
                      value={categoryForm.name}
                      onChange={(e) =>
                        setCategoryForm({ ...categoryForm, name: e.target.value })
                      }
                    />
                    <Input
                      placeholder="Description"
                      value={categoryForm.description}
                      onChange={(e) =>
                        setCategoryForm({
                          ...categoryForm,
                          description: e.target.value,
                        })
                      }
                    />
                    <Input
                      placeholder="Icon (emoji or icon name)"
                      value={categoryForm.icon}
                      onChange={(e) =>
                        setCategoryForm({ ...categoryForm, icon: e.target.value })
                      }
                    />
                    <Button
                      onClick={handleSaveCategory}
                      className="w-full cyber-button"
                      disabled={upsertCategoryMutation.isPending}
                    >
                      {upsertCategoryMutation.isPending ? "Saving..." : "Save Category"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories && categories.length > 0 ? (
                categories.map((category) => (
                  <Card key={category.id} className="cyber-card p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="text-lg font-bold mb-2">
                          {category.icon} {category.name}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {category.description}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEditCategory(category)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </Card>
                ))
              ) : (
                <p className="text-muted-foreground text-center py-8 col-span-full">
                  No categories yet. Create one to organize your products.
                </p>
              )}
            </div>
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === "orders" && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Orders</h2>
            <div className="space-y-4">
              {orders && orders.length > 0 ? (
                orders.map((order) => (
                  <Card key={order.id} className="cyber-card p-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-bold mb-2">
                          Order #{order.id}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-2">
                          User ID: {order.userId}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
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
                  </Card>
                ))
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  No orders yet.
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
