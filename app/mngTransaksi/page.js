"use client";

import { useEffect, useState } from "react";

export default function mngTransaksiPage() {
    const [transactions, setTransactions] = useState([]);
    const [type, setType] = useState("income");
    const [amount, setAmount] = useState("");
    const [date, setDate] = useState("");
    const [description, setDescription] = useState("");
    const [editId, setEditId] = useState(null);

    // Read - process
    async function ambilTrans() {
        const res = await fetch("/api/mngTransaksi");
        const data = await res.json();

        setTransactions(data);
    }

    useEffect(() => {
        ambilTrans();
    }, []);

    // Create - process (menambah data transaksi)
    async function tambahTrans() {
        const res = await fetch("/api/mngTransaksi", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                type: type,
                amount: amount,
                date: date,
                description: description
            })
        });

        const data = await res.json();

        setTransactions([...transactions, data]);
    }

    // Edit/Update - process (mengubah data transaksi)
    function mulaiEdit(trans) {
        setEditId(trans.id);
        setType(trans.type);
        setAmount(trans.amount);
        setDate(trans.date);
        setDescription(trans.description);
    }

    return (
        <div>
            <h1>SOLUSI SALDO</h1>
            <h2>Manajemen Transaksi</h2>

            {transactions.map((trans) => (
                <div key={trans.id}>
                    <p>Type: {trans.type}</p>
                    <p>Amount: {trans.amount}</p>
                    <p>Date: {trans.date}</p>
                    <p>Description: {trans.description}</p>
                </div>
            ))}

            <form onSubmit={tambahTrans}>
                <div>
                    <label>Type</label>
                    <select
                        value={type}
                        onChange={(e) => setType(e.target.value)}
                    >
                        <option value="income">Income</option>
                        <option value="expense">Expense</option>
                    </select>
                </div>

                <div>
                    <label>Amount</label>
                    <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                    />
                </div>

                <div>
                    <label>Date</label>
                    <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                    />
                </div>

                <div>
                    <label>Description</label>
                    <input
                        type="text"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />
                </div>

                <button type="submit">Tambah Transaksi</button>
            </form>
        </div>
        
    );
}
