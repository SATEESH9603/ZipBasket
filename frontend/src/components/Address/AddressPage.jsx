import React, { useEffect, useState } from "react";
import "./AddressPage.css";
import { getAddresses, addAddress, deleteAddress } from "../../services/api";
import { toast } from "react-toastify";

export default function AddressPage({ username, token }) {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [form, setForm] = useState({ type: "HOME", line1: "", line2: "", city: "", state: "", postalCode: "", country: "India", default: false });

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      setErr("");
      try {
        const res = await getAddresses(username, token);
        if (mounted) setList(Array.isArray(res) ? res : (res?.data ?? []));
      } catch (e) {
        if (mounted) setErr("Failed to load addresses");
        toast.error(e?.message || "Failed to load addresses");
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => (mounted = false);
  }, [username, token]);

  function onChange(e){
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  }

  async function onAdd(){
    try {
      await addAddress(username, form, token);
      const res = await getAddresses(username, token);
      setList(Array.isArray(res) ? res : (res?.data ?? []));
      setForm({ type: "HOME", line1: "", line2: "", city: "", state: "", postalCode: "", country: "India", default: false });
      toast.success("Address added");
    } catch (e) {
      toast.error(e?.message || "Failed to add address");
    }
  }

  async function onDelete(addressId){
    try {
      await deleteAddress(username, addressId, token);
      setList(list.filter(a => a.id !== addressId));
      toast.success("Address deleted");
    } catch (e) {
      toast.error(e?.message || "Failed to delete address");
    }
  }

  if (loading) return <div className="address-page"><p>Loading…</p></div>;
  if (err) return <div className="address-page"><p className="error">{err}</p></div>;

  return (
    <div className="address-page">
      <h2>Your Addresses</h2>
      <div className="address-form">
        <select name="type" value={form.type} onChange={onChange}>
          <option value="HOME">Home</option>
          <option value="WORK">Work</option>
          <option value="OTHER">Other</option>
        </select>
        <input name="line1" value={form.line1} onChange={onChange} placeholder="Line 1" />
        <input name="line2" value={form.line2} onChange={onChange} placeholder="Line 2" />
        <input name="city" value={form.city} onChange={onChange} placeholder="City" />
        <input name="state" value={form.state} onChange={onChange} placeholder="State" />
        <input name="postalCode" value={form.postalCode} onChange={onChange} placeholder="Postal Code" />
        <input name="country" value={form.country} onChange={onChange} placeholder="Country" />
        <label className="default-row">
          <input type="checkbox" name="default" checked={form.default} onChange={onChange} /> Set as default
        </label>
        <button onClick={onAdd}>Add Address</button>
      </div>
      <div className="address-list">
        {Array.isArray(list) && list.length === 0 ? (
          <p>No addresses saved.</p>
        ) : (
          (Array.isArray(list) ? list : []).map(a => (
            <div className="address-item" key={a.id}>
              <div>
                <p>{a.type}</p>
                <p>{a.line1}</p>
                {a.line2 && <p>{a.line2}</p>}
                <p>{a.city}, {a.state} {a.postalCode}</p>
                <p>{a.country}</p>
                {a.default && <p>(Default)</p>}
              </div>
              <button onClick={() => onDelete(a.id)}>Delete</button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
