// QuickAddModal.jsx
import React, { useEffect, useMemo, useState } from "react";
import { CURRENCY_OPTIONS, CATEGORY_OPTIONS } from "./constants";
import "../seller/QuickAddModal.css";

export default function QuickAddModal({
  open,
  onClose,
  user,
  token,                 // (unused here but kept for future direct API calls)
  defaultDraft,
  onSubmit,              // (payload) => Promise|void

  // 🚀 NEW (all optional; no behavior change if you omit them)
  mode = "create",       // "create" | "edit"
  initialValues,         // object of product fields to prefill
  fieldsToEdit,          // e.g. ["price","quantity","images","isActive","description"]
  titleLabel,            // override modal title
  submitLabel,           // override submit button label
}) {
  const [submitting, setSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState("");

  // helper: is this field editable in current mode?
  const isEditable = (fieldName) => {
    if (mode !== "edit") return true;                 // in create mode everything is editable
    if (!Array.isArray(fieldsToEdit) || fieldsToEdit.length === 0) return true; // if no list provided, editable
    return fieldsToEdit.includes(fieldName);
  };

  const baseInitial = useMemo(() => ({
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

  // 🔁 When editing, prefill with provided values (without changing create defaults)
  const composedInitial = useMemo(() => {
    if (mode !== "edit" || !initialValues) return baseInitial;

    // Safely map common shapes from product into our form fields
    const from = initialValues;
    const img =
      typeof from?.images === "string" ? from.images :
      typeof from?.image === "string" ? from.image :
      Array.isArray(from?.images)
        ? (typeof from.images[0] === "string"
            ? from.images[0]
            : (from.images[0]?.url || from.images[0]?.src || ""))
        : (from?.images?.url || from?.images?.src || "");

    return {
      ...baseInitial,
      sellerId: from?.sellerId ?? baseInitial.sellerId,
      name: from?.name ?? baseInitial.name,
      description: from?.description ?? baseInitial.description,
      price: from?.price ?? baseInitial.price,
      currency: (from?.currency || baseInitial.currency || "INR").toString().toUpperCase(),
      quantity: from?.quantity ?? from?.stock ?? baseInitial.quantity,
      sku: from?.sku ?? baseInitial.sku,
      category: (from?.category || baseInitial.category || "ELECTRONICS").toString().toUpperCase(),
      images: img || baseInitial.images,
      weight: from?.weight ?? baseInitial.weight,
      dimensions: from?.dimensions ?? baseInitial.dimensions,
      isActive: (from?.isActive ?? from?.active ?? baseInitial.isActive) ? true : false,
      metadata: typeof from?.metadata === "string" ? from.metadata : (from?.metadata ? JSON.stringify(from.metadata) : baseInitial.metadata),
    };
  }, [mode, initialValues, baseInitial]);

  const [form, setForm] = useState(composedInitial);

  useEffect(() => {
    setForm(composedInitial);
    setImagePreview(composedInitial.images ? String(composedInitial.images) : "");
  }, [composedInitial, open]);

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

    // Keep your original validations for create;
    // in edit, we only validate fields that remain editable to avoid blocking partial updates.
    if (mode !== "edit" || isEditable("name")) {
      if (!form.name?.trim()) return alert("Please enter product name");
    }
    if (mode !== "edit" || isEditable("price")) {
      if (!form.price || isNaN(Number(form.price))) return alert("Enter a valid price");
    }
    if (mode !== "edit" || isEditable("sku")) {
      if (!form.sku?.trim()) return alert("Please enter SKU");
    }

    const payload = {
      ...form,
      price: String(form.price).trim(),
      quantity: Number(form.quantity || 1),
      stock: Number(form.quantity || 1),      // keep your stock mapping for UI/legacy readers
      active: Boolean(form.isActive),
      isActive: Boolean(form.isActive),
      weight: form.weight === "" ? null : Number(form.weight),
      category: String(form.category || "OTHER").toUpperCase(),
      currency: String(form.currency || "INR").toUpperCase(),
    };

    try {
      setSubmitting(true);
      await onSubmit?.(payload);

      // 🔔 Preserve old alert for create; use a different one for edit (only when mode provided)
      if (mode === "edit") {
        alert("Product updated!");
      } else {
        alert("Product created (draft)!");
      }

      onClose?.();
    } catch (err) {
      alert(err?.message || (mode === "edit" ? "Failed to update product" : "Failed to create product"));
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) return null;

  const computedTitle =
    titleLabel || (mode === "edit" ? "Update Product" : "Quick Add Product");
  const computedSubmit =
    submitLabel || (mode === "edit" ? "Update product" : "Create product");

  return (
    <div
      className="sdx-modal-backdrop"
      onClick={(e) => {
        if (e.target.classList.contains("sdx-modal-backdrop")) onClose?.();
      }}
    >
      <div className="sdx-modal" role="dialog" aria-modal="true" aria-labelledby="qaTitle">
        <div className="sdx-modal-head">
          <h3 id="qaTitle" className="sdx-h3">{computedTitle}</h3>
          <button className="sdx-modal-close" onClick={onClose} aria-label="Close">✕</button>
        </div>

        <form className="sdx-modal-body" onSubmit={submit}>
          <div className="sdx-f">
            <label className="sdx-label">Seller ID</label>
            <input
              className="sdx-input"
              type="text"
              name="sellerId"
              value={form.sellerId}
              onChange={handleField}
              disabled={!isEditable("sellerId")}
            />
          </div>

          <div className="sdx-grid3">
            <div className="sdx-f">
              <label className="sdx-label">Name*</label>
              <input
                className="sdx-input"
                type="text"
                name="name"
                value={form.name}
                onChange={handleField}
                required={mode !== "edit" || isEditable("name")}
                disabled={!isEditable("name")}
              />
            </div>
            <div className="sdx-f">
              <label className="sdx-label">SKU*</label>
              <input
                className="sdx-input"
                type="text"
                name="sku"
                value={form.sku}
                onChange={handleField}
                required={mode !== "edit" || isEditable("sku")}
                disabled={!isEditable("sku")}
              />
            </div>
          </div>

          <div className="sdx-f">
            <label className="sdx-label">Description</label>
            <textarea
              className="sdx-input sdx-textarea"
              name="description"
              value={form.description}
              onChange={handleField}
              rows={3}
              disabled={!isEditable("description")}
            />
          </div>

          <div className="sdx-grid3">
            <div className="sdx-f">
              <label className="sdx-label">Price*</label>
              <input
                className="sdx-input"
                type="number"
                step="0.01"
                name="price"
                value={form.price}
                onChange={handleField}
                required={mode !== "edit" || isEditable("price")}
                disabled={!isEditable("price")}
              />
            </div>
            <div className="sdx-f">
              <label className="sdx-label">Currency</label>
              <select
                className="sdx-input"
                name="currency"
                value={form.currency}
                onChange={handleField}
                disabled={!isEditable("currency")}
              >
                {CURRENCY_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="sdx-f">
              <label className="sdx-label">Quantity</label>
              <input
                className="sdx-input"
                type="number"
                min="0"
                name="quantity"
                value={form.quantity}
                onChange={handleField}
                disabled={!isEditable("quantity")}
              />
            </div>
          </div>

          <div className="sdx-grid3">
            <div className="sdx-f">
              <label className="sdx-label">Category</label>
              <select
                className="sdx-input"
                name="category"
                value={form.category}
                onChange={handleField}
                disabled={!isEditable("category")}
              >
                {CATEGORY_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="sdx-f">
              <label className="sdx-label">Weight (g)</label>
              <input
                className="sdx-input"
                type="number"
                step="0.01"
                name="weight"
                value={form.weight ?? ""}
                onChange={handleField}
                disabled={!isEditable("weight")}
              />
            </div>
            <div className="sdx-f">
              <label className="sdx-label">Dimensions</label>
              <input
                className="sdx-input"
                type="text"
                name="dimensions"
                value={form.dimensions}
                onChange={handleField}
                placeholder="e.g. 146.7 x 71.5 x 7.8 mm"
                disabled={!isEditable("dimensions")}
              />
            </div>
          </div>

          <div className="sdx-grid3">
            <div className="sdx-f">
              <label className="sdx-label">Active</label>
              <label className="sdx-switch">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={!!form.isActive}
                  onChange={handleField}
                  disabled={!isEditable("isActive")}
                />
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
                disabled={!isEditable("metadata")}
              />
            </div>
          </div>

          <div className="sdx-f">
            <label className="sdx-label">Image</label>
            <div className="sdx-imgrow">
              <input
                type="file"
                accept="image/*"
                onChange={handleImage}
                disabled={!isEditable("images")}
              />
              {imagePreview && <img className="sdx-preview" src={imagePreview} alt="Preview" />}
            </div>
          </div>

          <div className="sdx-modal-foot">
            <button type="button" className="cta ghost" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="cta" disabled={submitting}>
              {submitting ? (mode === "edit" ? "Saving..." : "Saving...") : computedSubmit}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
