import React from "react";
import { useNavigate } from "react-router-dom";
import { 
  ShoppingCart,
  Package,
  Dog,
  House,
  CircleUserRound, // ✅ correct icon name
  CarTaxiFront
} from "lucide-react";

const services = [
  {
    id: 1,
    title: "Grocery & Shopping",
    desc: "Get fresh groceries, medicines, and daily essentials delivered by trusted neighbors from your favorite stores.",
    icon: ShoppingCart,
  },
  {
    id: 2,
    title: "Pickup & Delivery",
    desc: "Package collection, courier submissions and local deliveries handled with care.",
    icon: Package,
  },
  {
    id: 3,
    title: "Pet Care",
    desc: "Dog walking, pet sitting, vet visits, and pet care by verified animal lovers in your area.",
    icon: Dog,
  },
  {
    id: 4,
    title: "Household Tasks",
    desc: "Small repairs, cleaning assistance, furniture assembly, and home organization by skilled helpers.",
    icon: House,
  },
  {
    id: 5,
    title: "Personal Assistance",
    desc: "Queue waiting, appointment bookings, bank visits and other personal errands done efficiently.",
    icon: CircleUserRound, // ✅ correct name
  },
  {
    id: 6,
    title: "Transportation",
    desc: "Local rides, airport transfers, moving assistance and transportation help when you need it most.",
    icon: CarTaxiFront,
  },
];

const ServicesGrid = () => {
  const navigate = useNavigate();

  return (
    <section className="py-16 bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900">
            Popular Services
          </h2>
          <p className="mt-2 text-sm sm:text-base text-gray-700 max-w-2xl mx-auto">
            From everyday errands to special requests, our community helpers are ready to assist.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {services.map(({ id, title, desc, icon: Icon }) => (
            <button
              key={id}
              onClick={() => navigate("/signup")}
              className="group block focus:outline-none w-full text-left"
              aria-label={`Open ${title}`}
            >
              <article
                className="
                  h-full bg-white rounded-2xl border border-transparent
                  p-8 shadow-md
                  flex flex-col items-center text-center
                  transition transform duration-300 ease-out
                  group-hover:-translate-y-2 group-hover:scale-[1.03]
                  group-hover:shadow-xl
                  group-hover:border-blue-200
                "
              >
                {/* Icon */}
                <div
                  className="
                    h-16 w-16 flex items-center justify-center
                    bg-blue-600 text-white rounded-xl mb-4 drop-shadow
                  "
                >
                  <Icon size={36} strokeWidth={2.5} />
                </div>

                {/* Title */}
                <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600">
                  {title}
                </h3>

                {/* Description */}
                <p className="text-sm text-gray-500">{desc}</p>
              </article>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesGrid;
