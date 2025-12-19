"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';

export default function InventoryPage() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentItem, setCurrentItem] = useState({ name: "", description: "", price: 0, quantity: 0 });
    const [error, setError] = useState(null);
    const { user, loading: authLoading, logout } = useAuth();
    const router = useRouter();

    const API_URL = "http://127.0.0.1:8001/api/items";

    useEffect(() => {
        if (!authLoading && !user) {
            router.push("/login");
        }
    }, [user, authLoading, router]);

    const getAuthHeaders = async () => {
        if (!user) return {};
        const token = await user.getIdToken();
        return {
            "Authorization": `Bearer ${token}`
        };
    };

    useEffect(() => {
        fetchItems();
    }, []);

    const fetchItems = async () => {
        try {
            setLoading(true);
            const headers = await getAuthHeaders();
            const res = await fetch(API_URL, { headers });
            if (!res.ok) throw new Error("Failed to fetch items");
            const data = await res.json();
            setItems(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async (e) => {
        const term = e.target.value;
        setSearchTerm(term);
        if (term.length > 2) {
            try {
                const headers = await getAuthHeaders();
                const res = await fetch(`${API_URL}/search?q=${term}`, { headers });
                const data = await res.json();
                setItems(data);
            } catch (err) {
                console.error(err);
            }
        } else if (term.length === 0) {
            fetchItems();
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const method = currentItem.id ? "PUT" : "POST";
        const url = currentItem.id ? `${API_URL}/${currentItem.id}` : API_URL;

        try {
            const authHeaders = await getAuthHeaders();
            const res = await fetch(url, {
                method,
                headers: {
                    ...authHeaders,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(currentItem),
            });
            if (res.ok) {
                setIsModalOpen(false);
                setCurrentItem({ name: "", description: "", price: 0, quantity: 0 });
                fetchItems();
            }
        } catch (err) {
            setError(err.message);
        }
    };

    const handleDelete = async (id) => {
        if (confirm("Are you sure you want to delete this item?")) {
            try {
                const headers = await getAuthHeaders();
                await fetch(`${API_URL}/${id}`, {
                    method: "DELETE",
                    headers
                });
                fetchItems();
            } catch (err) {
                setError(err.message);
            }
        }
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append("file", file);

        try {
            const authHeaders = await getAuthHeaders();
            const res = await fetch(`${API_URL}/upload`, {
                method: "POST",
                headers: authHeaders,
                body: formData,
            });
            const data = await res.json();
            alert(data.message || "File uploaded successfully");
            fetchItems();
        } catch (err) {
            alert("Error uploading file: " + err.message);
        }
    };

    const totalValue = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const lowStockCount = items.filter(i => i.quantity < 5).length;

    if (authLoading || (!user && typeof window !== 'undefined')) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#0f172a', color: 'white' }}>
                Verifying session...
            </div>
        );
    }

    return (
        <div className="container">
            <header className="header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem', marginTop: '1rem', gap: '2rem' }}>
                <div style={{ flexShrink: 0 }}>
                    <h1 className="logo" style={{ fontSize: '1.75rem', margin: 0 }}>
                        Inventory<span className="text-gradient">Pro</span>
                    </h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.25rem' }}>Management Dashboard</p>
                </div>

                <div style={{ flex: 1, maxWidth: '600px', margin: '0 2rem' }}>
                    <input
                        type="text"
                        className="search-input"
                        placeholder="Search all items..."
                        style={{ width: '100%' }}
                        value={searchTerm}
                        onChange={handleSearch}
                    />
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', flexShrink: 0 }}>
                    <label className="btn-secondary">
                        <span>📁</span> Bulk Upload
                        <input type="file" onChange={handleFileUpload} accept=".xlsx,.xls" hidden />
                    </label>
                    <button className="btn-primary" onClick={() => { setCurrentItem({ name: "", description: "", price: 0, quantity: 0 }); setIsModalOpen(true); }}>
                        <span>+</span> Add Item
                    </button>
                    <button className="btn-secondary" onClick={logout} title="Logout">
                        <span>Logout</span>
                    </button>
                </div>
            </header>

            <main>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
                    <div className="glass" style={{ padding: '1.75rem' }}>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.75rem', letterSpacing: '0.05em' }}>Total Items</p>
                        <h2 style={{ fontSize: '2.5rem', margin: 0 }}>{items.length}</h2>
                    </div>
                    <div className="glass" style={{ padding: '1.75rem' }}>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.75rem', letterSpacing: '0.05em' }}>Inventory Value</p>
                        <h2 style={{ fontSize: '2.5rem', margin: 0 }}>${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h2>
                    </div>
                    <div className="glass" style={{ padding: '1.75rem' }}>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.75rem', letterSpacing: '0.05em' }}>Low Stock</p>
                        <h2 style={{ fontSize: '2.5rem', margin: 0, color: lowStockCount > 0 ? 'var(--danger)' : 'var(--text-main)' }}>{lowStockCount}</h2>
                    </div>
                </div>

                <div className="glass" style={{ padding: '0.5rem', overflow: 'hidden' }}>
                    <div className="table-wrapper">
                        {loading ? (
                            <div style={{ padding: '6rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                                <div style={{ fontSize: '1.1rem', fontWeight: 500 }}>Syncing with database...</div>
                            </div>
                        ) : (
                            <table>
                                <thead>
                                    <tr>
                                        <th>Item Details</th>
                                        <th>Description</th>
                                        <th>Price</th>
                                        <th>Stock Level</th>
                                        <th>Total Value</th>
                                        <th style={{ textAlign: 'right' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {items.length === 0 ? (
                                        <tr>
                                            <td colSpan="6" style={{ textAlign: 'center', padding: '5rem', color: 'var(--text-muted)' }}>
                                                <div style={{ fontSize: '1.1rem' }}>No inventory items found.</div>
                                                <p style={{ marginTop: '0.5rem', opacity: 0.7 }}>Click "Add Item" to get started.</p>
                                            </td>
                                        </tr>
                                    ) : (
                                        items.map(item => (
                                            <tr key={item.id}>
                                                <td>
                                                    <div style={{ fontWeight: 600, fontSize: '1rem' }}>{item.name}</div>
                                                </td>
                                                <td style={{ color: 'var(--text-muted)', fontSize: '0.9rem', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                    {item.description || 'No description provided'}
                                                </td>
                                                <td style={{ fontVariantNumeric: 'tabular-nums', fontWeight: 500 }}>${item.price.toFixed(2)}</td>
                                                <td>
                                                    <span className={`badge ${item.quantity < 5 ? 'badge-danger' : 'badge-success'}`}>
                                                        {item.quantity} units
                                                    </span>
                                                </td>
                                                <td style={{ fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>${(item.price * item.quantity).toFixed(2)}</td>
                                                <td style={{ textAlign: 'right' }}>
                                                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                                        <button className="btn-secondary" style={{ padding: '0.5rem', width: '36px', height: '36px', justifyContent: 'center' }} onClick={() => { setCurrentItem(item); setIsModalOpen(true); }} title="Edit">
                                                            ✏️
                                                        </button>
                                                        <button className="btn-danger" style={{ padding: '0.5rem', width: '36px', height: '36px', justifyContent: 'center' }} onClick={() => handleDelete(item.id)} title="Delete">
                                                            🗑️
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </main>

            {isModalOpen && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '1rem' }}>
                    <div className="glass" style={{ width: '100%', maxWidth: '540px', padding: '2.5rem', border: '1px solid rgba(255,255,255,0.15)' }}>
                        <h2 style={{ marginBottom: '1.75rem', fontSize: '1.5rem' }}>{currentItem.id ? "Modify Inventory Item" : "Create New Inventory Record"}</h2>
                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.75rem' }}>Item Name</label>
                                <input
                                    required
                                    autoFocus
                                    style={{ width: '100%' }}
                                    placeholder="e.g. Sony PlayStation 5"
                                    value={currentItem.name}
                                    onChange={e => setCurrentItem({ ...currentItem, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.75rem' }}>Description</label>
                                <textarea
                                    rows="3"
                                    style={{ width: '100%', resize: 'none' }}
                                    placeholder="Briefly describe the item..."
                                    value={currentItem.description}
                                    onChange={e => setCurrentItem({ ...currentItem, description: e.target.value })}
                                />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.75rem' }}>Price ($)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        required
                                        style={{ width: '100%' }}
                                        placeholder="0.00"
                                        value={currentItem.price}
                                        onChange={e => setCurrentItem({ ...currentItem, price: parseFloat(e.target.value) })}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.75rem' }}>Initial Quantity</label>
                                    <input
                                        type="number"
                                        required
                                        style={{ width: '100%' }}
                                        placeholder="1"
                                        value={currentItem.quantity}
                                        onChange={e => setCurrentItem({ ...currentItem, quantity: parseInt(e.target.value) })}
                                    />
                                </div>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem' }}>
                                <button type="button" className="btn-secondary" style={{ minWidth: '100px' }} onClick={() => setIsModalOpen(false)}>Cancel</button>
                                <button type="submit" className="btn-primary" style={{ minWidth: '160px' }}>
                                    {currentItem.id ? "Update Changes" : "Register Item"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
