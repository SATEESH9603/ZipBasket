import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import QuickAddModal from "../components/seller/QuickAddModal";
import * as api from "../services/api"; // assumes getProductById + updateProduct exist

export default function EditProductRoute({ token }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.updateProduct(id, token);
        setProduct(res?.data || res);
      } catch (e) {
        console.error(e);
      }
    };
    load();
  }, [id, token]);

  const handleUpdate = async (payload) => {
    try {
      await api.updateProduct(id, payload, token);
      alert("Product updated!");
      navigate(-1);
    } catch (err) {
      console.error(err);
      alert("Failed to update product");
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
    />
  );
}
