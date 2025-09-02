"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Navbar from "@/components/Navbar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "@/lib/toast";
import { Product, ProductCreate } from "@/types/product";
import { RefreshCw, Plus, Edit2, Trash2, Loader2Icon } from "lucide-react";

const fetchProducts = async (): Promise<Product[]> => {
  const res = await fetch("/api/products");
  if (!res.ok) {
    throw new Error("Network response was not ok");
  }
  return res.json();
};

const createProduct = async (product: ProductCreate) => {
  const res = await fetch("/api/products", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(product),
  });
  if (!res.ok) {
    throw new Error("Network response was not ok");
  }
  return res.json();
};

const updateProduct = async (product: Product) => {
  const res = await fetch(`/api/products/${product._id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: product.name,
      description: product.description,
    }),
  });
  if (!res.ok) {
    throw new Error("Network response was not ok");
  }
  return res.json();
};

const deleteProduct = async (id: string) => {
  const res = await fetch(`/api/products/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) {
    throw new Error("Network response was not ok");
  }
  return res.json();
};

export default function ManageProducts() {
  const queryClient = useQueryClient();
  const {
    data: products,
    isLoading,
    isError,
    error,
    refetch,
    isRefetching,
  } = useQuery<Product[]>({
    queryKey: ["products"],
    queryFn: fetchProducts,
  });

  const createMutation = useMutation({
    mutationFn: createProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Product created successfully");
      resetForm();
    },
    onError: () => {
      toast.error("Failed to create product");
    },
  });

  const updateMutation = useMutation({
    mutationFn: updateProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Product updated successfully");
      resetForm();
    },
    onError: () => {
      toast.error("Failed to update product");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Product deleted successfully");
    },
    onError: () => {
      toast.error("Failed to delete product");
    },
  });

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);

  const isFormLoading = createMutation.isPending || updateMutation.isPending;

  const resetForm = () => {
    setName("");
    setDescription("");
    setEditingProduct(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.warning("Product name is required");
      return;
    }
    if (editingProduct) {
      updateMutation.mutate({ ...editingProduct, name, description });
    } else {
      createMutation.mutate({ name, description });
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setName(product.name);
    setDescription(product.description || "");
  };

  const handleDelete = (product: Product) => {
    setDeletingProduct(product);
  };

  const confirmDelete = () => {
    if (deletingProduct) {
      deleteMutation.mutate(deletingProduct._id);
      setDeletingProduct(null);
    }
  };

  const handleCancel = () => {
    resetForm();
  };

  return (
    <div className="min-h-screen">
      <Navbar currentPage="manage" />
      <div className="max-w-4xl mx-auto py-12 sm:px-8 lg:px-12">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-foreground">
            Manage Products
          </h1>
          <Button
            onClick={() => refetch()}
            disabled={isRefetching}
            variant="outline"
            className="disabled:cursor-not-allowed"
          >
            {isRefetching ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Refreshing...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh
              </>
            )}
          </Button>
        </div>

        {/* Add/Edit Product Form */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              {editingProduct ? "Edit Product" : "Add New Product"}
            </CardTitle>
            <CardDescription>
              {editingProduct
                ? "Update the product information below."
                : "Create a new product by filling out the form below."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label
                  htmlFor="name"
                  className="block text-sm font-medium text-foreground mb-2"
                >
                  Product Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter product name"
                  className="w-full disabled:cursor-not-allowed"
                  disabled={isFormLoading}
                />
              </div>

              <div>
                <Label
                  htmlFor="description"
                  className="block text-sm font-medium text-foreground mb-2"
                >
                  Product Description
                </Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter product description (optional)"
                  rows={4}
                  className="w-full disabled:cursor-not-allowed resize-none"
                  disabled={isFormLoading}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="submit"
                  className="disabled:cursor-not-allowed"
                  disabled={isFormLoading}
                >
                  {isFormLoading ? (
                    <>
                      <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                      {editingProduct ? "Updating..." : "Creating..."}
                    </>
                  ) : (
                    <>
                      {editingProduct ? (
                        <>
                          <Edit2 className="mr-2 h-4 w-4" />
                          Update Product
                        </>
                      ) : (
                        <>
                          <Plus className="mr-2 h-4 w-4" />
                          Add Product
                        </>
                      )}
                    </>
                  )}
                </Button>

                {editingProduct ? (
                  <Button
                    type="button"
                    onClick={handleCancel}
                    disabled={isFormLoading}
                    variant="outline"
                    className="disabled:cursor-not-allowed"
                  >
                    Cancel
                  </Button>
                ) : (
                  <Button
                    type="button"
                    onClick={resetForm}
                    disabled={isFormLoading}
                    variant="outline"
                    className="disabled:cursor-not-allowed"
                  >
                    Reset
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Products List */}
        <Card>
          <CardHeader>
            <CardTitle>Product List</CardTitle>
            <CardDescription>
              Manage your existing products. Click edit to modify or delete to
              remove a product.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2Icon className="mr-2 h-6 w-6 animate-spin" />
                <span className="text-muted-foreground">
                  Loading products...
                </span>
              </div>
            ) : isError ? (
              <div className="text-center py-12">
                <div className="text-destructive mb-4">
                  <p className="font-medium">Failed to load products</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {error instanceof Error
                      ? error.message
                      : "An unknown error occurred."}
                  </p>
                </div>
                <Button onClick={() => refetch()} variant="outline">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Try Again
                </Button>
              </div>
            ) : products && products.length > 0 ? (
              <div className="space-y-3">
                {products.map((product) => (
                  <div
                    key={product._id}
                    className="flex items-center justify-between p-4 border border-border rounded-lg bg-card hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground truncate">
                        {product.name}
                      </h3>
                      {product.description && (
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          {product.description}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(product)}
                        className="disabled:cursor-not-allowed"
                        disabled={isFormLoading}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(product)}
                        className="disabled:cursor-not-allowed"
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-muted-foreground mb-4">
                  <p className="font-medium">No products found</p>
                  <p className="text-sm mt-1">
                    Get started by creating your first product above.
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Delete Confirmation Dialog */}
        <Dialog
          open={!!deletingProduct}
          onOpenChange={(isOpen) => !isOpen && setDeletingProduct(null)}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Product</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete &quot;{deletingProduct?.name}&quot;? This
                action cannot be undone and will permanently remove the product.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button
                variant="destructive"
                onClick={confirmDelete}
                disabled={deleteMutation.isPending}
                className="disabled:cursor-not-allowed"
              >
                {deleteMutation.isPending ? (
                  <>
                    <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Product
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
