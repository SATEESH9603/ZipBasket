import React, { useEffect, useMemo, useState } from "react";
import { CURRENCY_OPTIONS, CATEGORY_OPTIONS } from "./constants";
import "../seller/QuickAddModal.css";

export default function QuickAddModal({
  open,
  onClose,
  user,
  token,            // available if you later post directly
  defaultDraft,
  onSubmit,         // (payload) => Promise|void
}) {
  const [submitting, setSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState("");

  const initial = useMemo(() => ({
    sellerId: user?.id || user?.userId || "",
    name: "",
    description: "",
    price: "",
    currency: "INR",
    quantity: 1,
    sku: "",
    category: "ELECTRONICS",
    images: "",
    weight: "",
    dimensions: "",
    isActive: true,
    metadata: "",
    ...(defaultDraft || {}),
  }), [user, defaultDraft]);

  const [form, setForm] = useState(initial);
  useEffect(() => {
    setForm(initial);
    setImagePreview(initial.images ? String(initial.images) : "");
  }, [initial, open]);

  const handleField = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleImage = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setForm(prev => ({ ...prev, images: reader.result }));
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const submit = async (e) => {
    e?.preventDefault?.();
    if (!form.name?.trim()) return alert("Please enter product name");
    if (!form.price || isNaN(Number(form.price))) return alert("Enter a valid price");
    if (!form.sku?.trim()) return alert("Please enter SKU");

    const payload = {
      ...form,
      price: String(form.price).trim(),
      quantity: Number(form.quantity || 1),
      stock: Number(form.quantity || 1),      // <— map quantity to stock for UI/legacy readers
      active: Boolean(form.isActive),         // <— persist “active” for status pill
      isActive: Boolean(form.isActive),       // keep your original key too
      weight: form.weight === "" ? null : Number(form.weight),
      category: String(form.category || "OTHER").toUpperCase(),
      currency: String(form.currency || "INR").toUpperCase(),
    };

    try {
      setSubmitting(true);
      await onSubmit?.(payload);
      alert("Product created (draft)!");
      onClose?.();
    } catch (err) {
      alert(err?.message || "Failed to create product");
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <div
      className="sdx-modal-backdrop"
      onClick={(e) => {
        if (e.target.classList.contains("sdx-modal-backdrop")) onClose?.();
      }}
    >
      <div className="sdx-modal" role="dialog" aria-modal="true" aria-labelledby="qaTitle">
        <div className="sdx-modal-head">
          <h3 id="qaTitle" className="sdx-h3">Quick Add Product</h3>
          <button className="sdx-modal-close" onClick={onClose} aria-label="Close">✕</button>
        </div>

        <form className="sdx-modal-body" onSubmit={submit}>
          <div className="sdx-f">
            <label className="sdx-label">Seller ID</label>
            <input className="sdx-input" type="text" name="sellerId" value={form.sellerId} onChange={handleField} />
          </div>

          <div className="sdx-grid3">
            <div className="sdx-f">
              <label className="sdx-label">Name*</label>
              <input className="sdx-input" type="text" name="name" value={form.name} onChange={handleField} required />
            </div>
            <div className="sdx-f">
              <label className="sdx-label">SKU*</label>
              <input className="sdx-input" type="text" name="sku" value={form.sku} onChange={handleField} required />
            </div>
          </div>

          <div className="sdx-f">
            <label className="sdx-label">Description</label>
            <textarea className="sdx-input sdx-textarea" name="description" value={form.description} onChange={handleField} rows={3} />
          </div>

          <div className="sdx-grid3">
            <div className="sdx-f">
              <label className="sdx-label">Price*</label>
              <input className="sdx-input" type="number" step="0.01" name="price" value={form.price} onChange={handleField} required />
            </div>
            <div className="sdx-f">
              <label className="sdx-label">Currency</label>
              <select className="sdx-input" name="currency" value={form.currency} onChange={handleField}>
                {CURRENCY_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="sdx-f">
              <label className="sdx-label">Quantity</label>
              <input className="sdx-input" type="number" min="0" name="quantity" value={form.quantity} onChange={handleField} />
            </div>
          </div>

          <div className="sdx-grid3">
            <div className="sdx-f">
              <label className="sdx-label">Category</label>
              <select className="sdx-input" name="category" value={form.category} onChange={handleField}>
                {CATEGORY_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="sdx-f">
              <label className="sdx-label">Weight (g)</label>
              <input className="sdx-input" type="number" step="0.01" name="weight" value={form.weight ?? ""} onChange={handleField} />
            </div>
            <div className="sdx-f">
              <label className="sdx-label">Dimensions</label>
              <input className="sdx-input" type="text" name="dimensions" value={form.dimensions} onChange={handleField} placeholder="e.g. 146.7 x 71.5 x 7.8 mm" />
            </div>
          </div>

          <div className="sdx-grid3">
            <div className="sdx-f">
              <label className="sdx-label">Active</label>
              <label className="sdx-switch">
                <input type="checkbox" name="isActive" checked={!!form.isActive} onChange={handleField} />
                <span className="sdx-slider" />
              </label>
            </div>
            <div className="sdx-f">
              <label className="sdx-label">Metadata</label>
              <input
                className="sdx-input"
                type="text"
                name="metadata"
                value={form.metadata}
                onChange={handleField}
                placeholder='free text or JSON, e.g. {"color":"black"}'
              />
            </div>
          </div>

          <div className="sdx-f">
            <label className="sdx-label">Image</label>
            <div className="sdx-imgrow">
              <input type="file" accept="image/*" onChange={handleImage} />
              {imagePreview && <img className="sdx-preview" src={imagePreview} alt="Preview" />}
            </div>
          </div>

          <div className="sdx-modal-foot">
            <button type="button" className="cta ghost" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="cta" disabled={submitting}>
              {submitting ? "Saving..." : "Create product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
