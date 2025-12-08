import React, { useEffect, useState, useMemo } from "react";
import "./CheckoutPage.css";
import { getAddresses, checkout, viewCart } from "../../services/api";
import { toast } from "react-toastify";
import { useNavigate, useLocation } from "react-router-dom";

const inr = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' });

export default function CheckoutPage({ username, token }) {
  const [addresses, setAddresses] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [placing, setPlacing] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [deliveryFee, setDeliveryFee] = useState(0);

  const navigate = useNavigate();
  const location = useLocation();

  const refreshAddresses = async () => {
    const res = await getAddresses(username, token);
    const list = Array.isArray(res) ? res : (res?.data ?? []);
    setAddresses(list);
    const def = list.find(a => a.default) || list[0];
    if (def) setSelected(def.id);
  };

  const refreshCart = async () => {
    const res = await viewCart(username, token);
    const items = Array.isArray(res?.data?.items) ? res.data.items : (Array.isArray(res?.items) ? res.items : []);
    setCartItems(items);
    const subtotalCalc = items.reduce((sum, it) => {
      const price = Number(it?.product?.price ?? it?.price ?? it?.product?.unitPrice ?? 0);
      const qty = Number(it?.quantity ?? it?.qty ?? 1);
      return sum + price * qty;
    }, 0);
    setDeliveryFee(subtotalCalc >= 500 ? 0 : (items.length ? 49 : 0));
  };

  useEffect(() => {
    let mounted = true;
    async function load(){
      setLoading(true);
      setErr("");
      try {
        await Promise.all([refreshAddresses(), refreshCart()]);
      } catch (e) {
        if (mounted) setErr("Failed to load checkout data");
        toast.error(e?.message || "Failed to load checkout data");
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [username, token, location.key]);

  async function placeOrder(){
    if (!selected) return toast.info("Please select an address");
    if (!cartItems.length) return toast.info("Your cart is empty");
    setPlacing(true);
    try {
      const res = await checkout(username, selected, token);
      toast.success(res.data?.message || "Order placed!");
      navigate('/orders', { replace: true });
    } catch (e) {
      toast.error(e?.message || "Failed to place order");
    } finally {
      setPlacing(false);
    }
  }

  const itemsCount = useMemo(() => cartItems.reduce((sum, it) => sum + Number(it?.quantity ?? it?.qty ?? 1), 0), [cartItems]);
  const subtotal = useMemo(() => cartItems.reduce((sum, it) => {
    const price = Number(it?.product?.price ?? it?.price ?? it?.product?.unitPrice ?? 0);
    const qty = Number(it?.quantity ?? it?.qty ?? 1);
    return sum + price * qty;
  }, 0), [cartItems]);
  const orderTotal = subtotal + deliveryFee;

  if (loading) return <div className="checkout-page"><p>Loading…</p></div>;
  if (err) return <div className="checkout-page"><p className="error">{err}</p></div>;

  return (
    <div className="checkout-page">
      <h2>Checkout</h2>
      {addresses.length === 0 ? (
        <div className="no-address">
          <p>No addresses found.</p>
          <button className="add-address-btn" onClick={() => navigate('/addresses', { replace: true, state: { from: '/checkout' } })}>Add Address</button>
        </div>
      ) : (
        <div className="checkout-grid">
          <div className="checkout-left">
            <h3>Select a delivery address</h3>
            <div className="address-select">
              {addresses.map(a => (
                <label key={a.id} className={`addr-card ${selected === a.id ? 'selected' : ''}`}>
                  <input type="radio" name="addr" checked={selected === a.id} onChange={() => setSelected(a.id)} />
                  <div className="addr-body">
                    <div className="addr-type">{a.type || 'HOME'}</div>
                    <div className="addr-line">{a.line1}{a.line2 ? `, ${a.line2}` : ''}</div>
                    <div className="addr-city">{a.city}, {a.state} {a.postalCode}</div>
                    <div className="addr-country">{a.country}</div>
                    {a.default && <div className="addr-default">Default</div>}
                  </div>
                </label>
              ))}
            </div>
            <button className="link-btn" onClick={() => navigate('/addresses', { replace: true, state: { from: '/checkout' } })}>Manage addresses</button>
          </div>

          <div className="checkout-right">
            <div className="summary-card">
              <div className="summary-line"><span>Items</span><span>{itemsCount}</span></div>
              <div className="summary-line"><span>Subtotal</span><span>{inr.format(subtotal)}</span></div>
              <div className="summary-line"><span>Delivery</span><span>{deliveryFee ? inr.format(deliveryFee) : 'FREE'}</span></div>
              <div className="summary-total"><span>Order Total</span><span>{inr.format(orderTotal)}</span></div>
              <button className="place-order-btn" disabled={!selected || placing || !cartItems.length} onClick={placeOrder}>Place your order</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
