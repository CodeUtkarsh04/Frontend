import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
    ShoppingCart,
    Package,
    Dog,
    House,
    CircleUserRound,
    CarTaxiFront,
    Search,
    Filter,
    MapPin,
    Phone,
    Star,
} from "lucide-react";

const services = [
    {
        id: 1,
        title: "Grocery & Shopping",
        desc: "Get fresh groceries, medicines, and daily essentials delivered by trusted neighbours.",
        icon: ShoppingCart,
        category: "Delivery",
    },
    {
        id: 2,
        title: "Pickup & Delivery",
        desc: "Package collection, courier submissions and local deliveries handled with care.",
        icon: Package,
        category: "Delivery",
    },
    {
        id: 3,
        title: "Pet Care",
        desc: "Dog walking, pet sitting and vet visits by verified local pet lovers.",
        icon: Dog,
        category: "Personal",
    },
    {
        id: 4,
        title: "Household Tasks",
        desc: "Small repairs, cleaning assistance, furniture assembly and home organisation.",
        icon: House,
        category: "Home",
    },
    {
        id: 5,
        title: "Personal Assistance",
        desc: "Queue waiting, appointment bookings, bank visits and other personal errands.",
        icon: CircleUserRound,
        category: "Personal",
    },
    {
        id: 6,
        title: "Transportation",
        desc: "Local rides, airport transfers and moving assistance when you need it most.",
        icon: CarTaxiFront,
        category: "Transport",
    },
];

export default function ServicesPage() {
    const navigate = useNavigate();
    const [query, setQuery] = useState("");
    const [category, setCategory] = useState("All");
    const [sortBy, setSortBy] = useState("popular");

    const categories = useMemo(() => ["All", ...new Set(services.map((s) => s.category))], []);

    const filtered = useMemo(() => {
        let list = services;
        if (category !== "All") list = list.filter((s) => s.category === category);
        if (query) list = list.filter((s) => s.title.toLowerCase().includes(query.toLowerCase()) || s.desc.toLowerCase().includes(query.toLowerCase()));
        if (sortBy === "alpha") list = [...list].sort((a, b) => a.title.localeCompare(b.title));
        return list;
    }, [category, query, sortBy]);

    return (
        <div className="min-h-screen bg-gray-50 text-gray-900">
            {/* NAV simplified - reuse your app nav in actual project */}
            <nav className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center gap-4">
                            <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">DD</div>
                            <div className="font-semibold text-lg">DailyDone</div>
                        </div>
                        <div className="hidden md:flex items-center gap-6 text-sm text-gray-600">
                            <a href="/services" className="text-blue-600 font-medium">Services</a>
                            <a href="/how" className="hover:text-gray-900">How it works</a>
                            <a href="/about" className="hover:text-gray-900">About</a>
                        </div>
                    </div>
                </div>
            </nav>

            {/* HERO */}
            <header className="bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-20 flex flex-col lg:flex-row items-center gap-8">
                    <div className="w-full lg:w-3/5">
                        <h1 className="text-3xl sm:text-4xl font-extrabold leading-tight">Find the help you need — fast</h1>
                        <p className="mt-4 text-gray-600">Browse popular services, search by task or category, and connect directly with local helpers.</p>

                        <div className="mt-6 flex gap-3 items-center">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-3 text-gray-400" size={18} />
                                <input
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    placeholder="Search services, e.g.'cleaning','grocery'"
                                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 bg-white focus:ring-2 focus:ring-blue-200" />
                            </div>

                            <select
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                className="py-3 px-4 rounded-lg border border-gray-200 bg-white"
                            >
                                {categories.map((c) => (
                                    <option key={c} value={c}>{c}</option>
                                ))}
                            </select>

                            <button
                                onClick={() => { setQuery(""); setCategory("All"); setSortBy("popular"); }}
                                className="px-4 py-3 rounded-lg border border-gray-200 bg-white text-sm"
                            >
                                Reset
                            </button>
                        </div>

                        <div className="mt-6 flex gap-3">
                            <button onClick={() => setSortBy("popular")} className={`px-4 py-2 rounded-md ${sortBy === "popular" ? "bg-blue-600 text-white" : "bg-white border"}`}>
                                Popular
                            </button>
                            <button onClick={() => setSortBy("alpha")} className={`px-4 py-2 rounded-md ${sortBy === "alpha" ? "bg-blue-600 text-white" : "bg-white border"}`}>
                                A → Z
                            </button>
                        </div>
                    </div>

                    {/* RIGHT SIDE - Nearby activity (replace previous location card) */}
                    <div className="w-full lg:w-2/5">
                        <div className="bg-gradient-to-br from-blue-50 to-white p-4 sm:p-6 rounded-2xl shadow-lg">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="text-sm text-gray-500">Nearby activity</div>
                                    <div className="text-sm font-semibold text-gray-900">Live updates from your area</div>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="text-green-600 flex items-center gap-1 pr-2"> ⬤</div>
                                    <div className="text-xs text-gray-400 flex items-center gap-1 pr-2"> updated</div>
                                </div>
                            </div>

                            <ul className="mt-4 space-y-3 text-sm">
                                <li className="flex items-start gap-3">
                                    <div className="h-8 w-8 rounded-full bg-white flex items-center justify-center text-sm font-semibold text-blue-600 border">1m</div>
                                    <div>
                                        <div className="font-medium">New task: Pickup & Delivery</div>
                                        <div className="text-gray-500">Posted 5 minutes ago • 2 helpers nearby</div>
                                    </div>
                                </li>

                                <li className="flex items-start gap-3">
                                    <div className="h-8 w-8 rounded-full bg-white flex items-center justify-center text-sm font-semibold text-blue-600 border">2m</div>
                                    <div>
                                        <div className="font-medium">Helper accepted: Grocery order</div>
                                        <div className="text-gray-500">Confirmed — arriving in 15 mins</div>
                                    </div>
                                </li>

                                <li className="flex items-start gap-3">
                                    <div className="h-8 w-8 rounded-full bg-white flex items-center justify-center text-sm font-semibold text-blue-600 border">5m</div>
                                    <div>
                                        <div className="font-medium">Popular: Home cleaning</div>
                                        <div className="text-gray-500">3 tasks posted today in your area</div>
                                    </div>
                                </li>
                            </ul>

                            <div className="mt-5 flex gap-2">
                                <button
                                    onClick={() => navigate('/post-task')}
                                    className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-md text-sm cursor-pointer"
                                >
                                    Post a task
                                </button>
                                <button
                                    onClick={() => navigate('/signup')}
                                    className="flex-1 px-3 py-2 border rounded-md text-sm cursor-pointer"
                                >
                                    Become a helper
                                </button>
                            </div>
                        </div>
                    </div>

                </div>
            </header>

            {/* SERVICES GRID */}
            <main className="py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="md:col-span-2">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filtered.map((s) => (
                                    <ServiceCard key={s.id} service={s} onOpen={() => navigate(`/signup`)} />
                                ))}
                            </div>

                            {/* empty state */}
                            {filtered.length === 0 && (
                                <div className="mt-8 bg-white p-6 rounded-lg text-center">
                                    No services found. Try a different search or category.
                                </div>
                            )}
                        </div>

                        {/* Sidebar */}
                        <aside className="hidden md:block">
                            <div className="bg-white p-6 rounded-2xl shadow-md">
                                <h4 className="font-semibold">Top categories</h4>
                                <div className="mt-4 grid gap-2">
                                    {categories.slice(1).map((c) => (
                                        <button key={c} onClick={() => setCategory(c)} className="text-left px-3 py-2 rounded-md hover:bg-gray-50">{c}</button>
                                    ))}
                                </div>

                                <div className="mt-6">
                                    <h5 className="font-semibold">Why choose us</h5>
                                    <div className="mt-2 text-sm text-gray-600 flex items-start gap-2"><Star size={16} /> <span>Verified helpers & community reviews</span></div>
                                </div>
                            </div>

                            <div className="mt-6 bg-white p-6 rounded-2xl shadow-md">
                                <h5 className="font-semibold">Need help posting?</h5>
                                <p className="text-sm text-gray-600 mt-2">We can guide you — call or message and we'll help post your first task.</p>
                                <div className="mt-4">
                                    <button onClick={() => navigate('/help')} className="px-4 py-2 bg-blue-600 text-white rounded-md cursor-pointer ">Contact us</button>
                                </div>
                            </div>
                        </aside>
                    </div>
                </div>
            </main>

            {/* FAQ & CTA */}
            <section className="py-12 bg-gradient-to-b from-white to-blue-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid md:grid-cols-2 gap-8 items-center">
                        <div>
                            <h3 className="text-2xl font-extrabold">Got questions?</h3>
                            <p className="mt-3 text-gray-600">FAQ and quick tips to help you use DailyDone safely and effectively.</p>

                            <div className="mt-6 space-y-3">
                                <details className="bg-white p-4 rounded-lg shadow-sm">
                                    <summary className="font-medium cursor-pointer">How do I pay helpers?</summary>
                                    <p className="mt-2 text-sm text-gray-600">Payments are made directly between users (cash or UPI). We recommend agreeing payment terms before work begins.</p>
                                </details>

                                <details className="bg-white p-4 rounded-lg shadow-sm">
                                    <summary className="font-medium cursor-pointer">Do you verify helpers?</summary>
                                    <p className="mt-2 text-sm text-gray-600">Helpers are encouraged to verify ID and collect ratings from users — always check profile details and reviews.</p>
                                </details>
                            </div>
                        </div>

                        <div>
                            <div className="bg-white p-6 rounded-2xl shadow-md text-center">
                                <h4 className="font-semibold">Ready to get started?</h4>
                                <p className="text-sm text-gray-600 mt-2">Post your task and find a local helper in minutes.</p>
                                <div className="mt-4 flex justify-center gap-3">
                                    <button onClick={() => navigate('/signup')} className="px-4 py-2 bg-blue-600 text-white rounded-md cursor-pointer">Post a task</button>
                                    <button onClick={() => navigate('/helper')} className="px-4 py-2 border rounded-md cursor-pointer">Become a helper</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}

function ServiceCard({ service, onOpen }) {
    const { title, desc, icon: Icon } = service;
    return (
        <article onClick={onOpen} className="cursor-pointer bg-white p-6 rounded-2xl shadow-sm hover:shadow-lg transition transform hover:-translate-y-1">
            <div className="flex flex-col items-center text-center">
                <div className="h-14 w-14 flex items-center justify-center bg-blue-600 rounded-full text-white mb-4">
                    <Icon size={28} strokeWidth={2.2} />
                </div>
                <h4 className="font-semibold mb-2">{title}</h4>
                <p className="text-sm text-gray-600">{desc}</p>
                <div className="mt-4 w-full text-left">
                </div>
            </div>
        </article>
    );
}