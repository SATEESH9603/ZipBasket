import React from "react";

const toText = (v) => {
  if (v == null) return "—";
  if (v instanceof Date) return v.toLocaleString();
  if (typeof v === "object") {
    try { return JSON.stringify(v); } catch { return String(v); }
  }
  return String(v);
};

const getImageUrl = (p) => {
  if (!p) return "/placeholder.png";
  if (typeof p?.image === "string") return p.image;
  if (typeof p?.images === "string") return p.images;
  if (Array.isArray(p?.images)) {
    const first = p.images[0];
    if (typeof first === "string") return first;
    if (first?.url) return first.url;
    if (first?.src) return first.src;
  }
  if (p?.images?.url) return p.images.url;
  if (p?.images?.src) return p.images.src;
  if (typeof p?.images === "object" && p?.images?.base64) return p.images.base64;
  return "/placeholder.png";
};

export default function SellerKPIs({ kpis = [] }) {
  return (
    <section className="seller-kpis">
      {kpis.map((k, i) => {
        const isArray = Array.isArray(k?.value);
        return (
          <div className="kpi" key={i}>
            <div className="kpi-label">{toText(k.label)}</div>

            {isArray ? (
              <>
                <div className="kpi-value">{k.value.length}</div>
                <div style={{ display: "flex", gap: "6px", marginTop: ".35rem", flexWrap: "wrap" }}>
                  {k.value.slice(0, 5).map((p, idx) => (
                    <img
                      key={p?.id ?? idx}
                      src={getImageUrl(p)}
                      alt={String(p?.name ?? "Product")}
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: 6,
                        objectFit: "cover",
                        border: "1px solid #f4b8b8",
                        background: "#fff"
                      }}
                    />
                  ))}
                </div>
              </>
            ) : (
              <div className="kpi-value">{toText(k.value)}</div>
            )}
          </div>
        );
      })}
    </section>
  );
}
