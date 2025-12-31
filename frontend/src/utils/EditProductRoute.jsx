import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import QuickAddModal from "../components/seller/QuickAddModal";
import * as api from "../services/api"; // assumes getProductById + updateProduct exist

export default function EditProductRoute({ token }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        // Fetch the product details for editing
        const res = await api.getProductById(id, token);
        const p = res?.data?.product ?? res?.product ?? null;
        setProduct(p);
      } catch (e) {
        toast.error(e?.message || "Failed to load product");
      }
    };
    load();
  }, [id, token]);

  const handleUpdate = async (payload) => {
    try {
      await api.updateProduct(id, payload, token);
      toast.success("Product updated");
      navigate(-1);
    } catch (err) {
      toast.error(err?.message || "Failed to update product");
    }
  };

  if (!product) return <p style={{ padding: 40 }}>Loading...</p>;

  return (
    <QuickAddModal
      open={true}
      onClose={() => navigate(-1)}
      user={{}}
      token={token}
      defaultDraft={product}
      onSubmit={handleUpdate}
      mode="edit"
      initialValues={product}
      fieldsToEdit={["price","quantity","images","active","description"]}
      titleLabel="Update Product"
      submitLabel="Update product"
    />
  );
}
