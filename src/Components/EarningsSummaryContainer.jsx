// EarningsSummaryContainer.jsx
import React, { useEffect, useRef, useState } from "react";
import EarningsSummary from "./EarningsSummary"; // ✅ correct UI import

function EarningsSummaryContainer() {
    const [stats, setStats] = useState({
        month: 0,
        week: 0,
        pending: 0,
        payouts: 0,
    });

    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState("");
    const did = useRef(false);

    const BASE = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");

    useEffect(() => {
        if (did.current) return;
        did.current = true;

        (async () => {
            try {
                const token = localStorage.getItem("token");
                const url = new URL("/profile/MoneyStats", BASE).toString();

                const res = await fetch(url, {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        Accept: "application/json",
                        "ngrok-skip-browser-warning": "true",
                    },
                });

                const text = await res.text();
                const json = JSON.parse(text);

                // ✅ backend sends flat JSON
                const p = json;

                setStats({
                    total: Number(p.totalEarnings ?? 0),
                    month: Number(p.monthlyEarnings ?? 0),
                    week: Number(p.weeklyEarnings ?? 0),
                    daily: Number(p.dailyEarnings ?? 0),
                });

                setErr("");
            } catch (e) {
                setErr(String(e.message || e));
            } finally {
                setLoading(false);
            }
        })();
    }, [BASE]);

    if (loading)
        return (
            <div className="bg-emerald-600 text-white p-8 rounded-2xl shadow-lg animate-pulse">
                Loading earnings…
            </div>
        );

    if (err)
        return (
            <div className="bg-red-600 text-white p-6 rounded-2xl">
                <p className="font-semibold">Couldn’t load earnings.</p>
                <p className="opacity-90 text-sm mt-1">{err}</p>
            </div>
        );

    return (
        <EarningsSummary
            total={stats.total}
            month={stats.month}
            week={stats.week}
            daily={stats.daily}
        />
    );
}

export default React.memo(EarningsSummaryContainer);
