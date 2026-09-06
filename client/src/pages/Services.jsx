import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../services/Api";

function Services() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [services, setServices] = useState([]);
  const [search, setSearch] = useState(searchParams.get("q") || "");
  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState("recommended");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadServices = async () => {
      setLoading(true); setError("");
      try {
        const response = await api.get("/services");
        setServices(Array.isArray(response.data.services) ? response.data.services : []);
      } catch (requestError) {
        setError(requestError.response?.data?.message || "Unable to load services. Please try again.");
      } finally { setLoading(false); }
    };
    loadServices();
  }, []);

  const categories = useMemo(() => [...new Set(services.map((service) => service.category_name).filter(Boolean))], [services]);

  const filteredServices = useMemo(() => {
    const query = search.trim().toLowerCase();
    const result = services.filter((service) => {
      const matchesSearch = !query || `${service.service_name} ${service.description || ""} ${service.category_name || ""}`.toLowerCase().includes(query);
      const matchesCategory = category === "all" || service.category_name === category;
      return matchesSearch && matchesCategory;
    });
    return [...result].sort((a, b) => sort === "price-low" ? Number(a.base_price || 0) - Number(b.base_price || 0) : sort === "price-high" ? Number(b.base_price || 0) - Number(a.base_price || 0) : String(a.service_name).localeCompare(String(b.service_name)));
  }, [services, search, category, sort]);

  return (
    <main className="services-page">
      <header className="services-header">
        <span className="eyebrow">EASYSERVICE MARKETPLACE</span>
        <h1>Find trusted help for every job.</h1>
        <p>Explore services, compare starting prices, and book a professional in a few clicks.</p>
        <div className="services-search"><span>⌕</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="What service do you need?" aria-label="Search services" /><kbd>Search</kbd></div>
      </header>

      <div className="services-toolbar">
        <div className="category-filters"><button className={category === "all" ? "active" : ""} onClick={() => setCategory("all")}>All</button>{categories.map((item) => <button key={item} className={category === item ? "active" : ""} onClick={() => setCategory(item)}>{item}</button>)}</div>
        <select value={sort} onChange={(event) => setSort(event.target.value)} aria-label="Sort services"><option value="recommended">Recommended</option><option value="price-low">Price: Low to High</option><option value="price-high">Price: High to Low</option></select>
      </div>

      {loading && <p className="no-services">Loading services...</p>}
      {!loading && error && <p className="no-services">{error}</p>}
      {!loading && !error && <div className="services-result-count">{filteredServices.length} service{filteredServices.length === 1 ? "" : "s"} available</div>}

      {!loading && !error && filteredServices.length > 0 && <div className="services-grid">{filteredServices.map((service) => <article className="service-card" key={service.id}>
        <div className="service-icon" aria-hidden="true">🛠️</div>
        {service.category_name && <span className="service-category">{service.category_name}</span>}
        <h2>{service.service_name}</h2>
        <p className="service-description">{service.description || "Professional service from trusted EasyService providers."}</p>
        <div className="service-footer"><div><small>Starting from</small><strong>Rs. {Number(service.base_price || 0).toLocaleString()}</strong></div><button className="book-btn" onClick={() => navigate(`/booking/${service.id}`, { state: { service } })}>Book Now →</button></div>
      </article>)}</div>}

      {!loading && !error && filteredServices.length === 0 && <div className="no-services"><h3>No matching services</h3><p>Try another search or category.</p><button onClick={() => { setSearch(""); setCategory("all"); }}>Clear filters</button></div>}
    </main>
  );
}

export default Services;
