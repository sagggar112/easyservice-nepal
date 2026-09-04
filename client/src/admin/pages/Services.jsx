import { useMemo, useState } from "react";
import AdminTable from "../components/AdminTable";
import AdminModal from "../components/AdminModal";
import ConfirmDialog from "../components/ConfirmDialog";

function Services() {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const [showForm, setShowForm] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  const [editingService, setEditingService] = useState(null);
  const [selectedService, setSelectedService] = useState(null);

  const [categories, setCategories] = useState([
    { id: 1, name: "Cleaning" },
    { id: 2, name: "Electrical" },
    { id: 3, name: "Plumbing" },
    { id: 4, name: "Repair & Maintenance" },
  ]);

  const [services, setServices] = useState([
    {
      id: 1,
      name: "Home Deep Cleaning",
      category: "Cleaning",
      description:
        "Complete professional deep cleaning for homes.",
      price: 2500,
      duration: "3 hours",
      status: "active",
      created_at: "2026-08-20",
    },
    {
      id: 2,
      name: "Electrical Repair",
      category: "Electrical",
      description:
        "Professional electrical inspection and repair.",
      price: 1200,
      duration: "2 hours",
      status: "active",
      created_at: "2026-08-18",
    },
    {
      id: 3,
      name: "Pipe & Tap Repair",
      category: "Plumbing",
      description:
        "Professional plumbing repair service.",
      price: 1000,
      duration: "1.5 hours",
      status: "inactive",
      created_at: "2026-08-15",
    },
  ]);

  const emptyForm = {
    name: "",
    category: "",
    description: "",
    price: "",
    duration: "",
    status: "active",
  };

  const [form, setForm] = useState(emptyForm);

  const filteredServices = useMemo(() => {
    return services.filter((service) => {
      const searchText = search.toLowerCase();

      const matchesSearch =
        service.name
          .toLowerCase()
          .includes(searchText) ||
        service.category
          .toLowerCase()
          .includes(searchText) ||
        service.description
          .toLowerCase()
          .includes(searchText);

      const matchesCategory =
        categoryFilter === "all" ||
        service.category === categoryFilter;

      const matchesStatus =
        statusFilter === "all" ||
        service.status === statusFilter;

      return (
        matchesSearch &&
        matchesCategory &&
        matchesStatus
      );
    });
  }, [
    services,
    search,
    categoryFilter,
    statusFilter,
  ]);

  const openAddForm = () => {
    setEditingService(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const openEditForm = (service) => {
    setEditingService(service);

    setForm({
      name: service.name,
      category: service.category,
      description: service.description,
      price: service.price,
      duration: service.duration,
      status: service.status,
    });

    setShowForm(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (
      !form.name ||
      !form.category ||
      !form.price
    ) {
      return;
    }

    if (editingService) {
      setServices((current) =>
        current.map((service) =>
          service.id === editingService.id
            ? {
                ...service,
                ...form,
                price: Number(form.price),
              }
            : service
        )
      );
    } else {
      const newService = {
        id: Date.now(),
        ...form,
        price: Number(form.price),
        created_at:
          new Date()
            .toISOString()
            .split("T")[0],
      };

      setServices((current) => [
        newService,
        ...current,
      ]);
    }

    setShowForm(false);
    setEditingService(null);
    setForm(emptyForm);
  };

  const openDetails = (service) => {
    setSelectedService(service);
    setShowDetails(true);
  };

  const openDelete = (service) => {
    setSelectedService(service);
    setShowDelete(true);
  };

  const deleteService = () => {
    if (!selectedService) return;

    setServices((current) =>
      current.filter(
        (service) =>
          service.id !== selectedService.id
      )
    );

    setShowDelete(false);
    setSelectedService(null);
  };

  const toggleStatus = (service) => {
    setServices((current) =>
      current.map((item) =>
        item.id === service.id
          ? {
              ...item,
              status:
                item.status === "active"
                  ? "inactive"
                  : "active",
            }
          : item
      )
    );
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const addCategory = () => {
    const name = window.prompt(
      "Enter category name:"
    );

    if (!name || !name.trim()) return;

    const exists = categories.some(
      (category) =>
        category.name.toLowerCase() ===
        name.trim().toLowerCase()
    );

    if (exists) {
      window.alert("Category already exists.");
      return;
    }

    setCategories((current) => [
      ...current,
      {
        id: Date.now(),
        name: name.trim(),
      },
    ]);
  };

  const columns = [
    {
      key: "service",
      label: "Service",
      render: (service) => (
        <div className="service-name-cell">
          <div className="service-icon">
            🔧
          </div>

          <div>
            <strong>{service.name}</strong>
            <span>
              ID #{service.id}
            </span>
          </div>
        </div>
      ),
    },

    {
      key: "category",
      label: "Category",
      render: (service) => (
        <span className="service-category">
          {service.category}
        </span>
      ),
    },

    {
      key: "price",
      label: "Starting Price",
      render: (service) => (
        <strong className="service-price">
          NPR {Number(service.price).toLocaleString()}
        </strong>
      ),
    },

    {
      key: "duration",
      label: "Duration",
    },

    {
      key: "status",
      label: "Status",
      render: (service) => (
        <span
          className={`admin-status ${service.status}`}
        >
          {service.status}
        </span>
      ),
    },

    {
      key: "actions",
      label: "Actions",
      render: (service) => (
        <div className="admin-actions">

          <button
            className="table-action view"
            title="View service"
            onClick={() =>
              openDetails(service)
            }
          >
            👁
          </button>

          <button
            className="table-action edit"
            title="Edit service"
            onClick={() =>
              openEditForm(service)
            }
          >
            ✎
          </button>

          <button
            className="table-action status"
            title="Change status"
            onClick={() =>
              toggleStatus(service)
            }
          >
            {service.status === "active"
              ? "⏸"
              : "▶"}
          </button>

          <button
            className="table-action delete"
            title="Delete service"
            onClick={() =>
              openDelete(service)
            }
          >
            🗑
          </button>

        </div>
      ),
    },
  ];

  return (
    <div className="admin-page">

      {/* HEADER */}

      <div className="admin-page-header">

        <div>
          <h1>Services</h1>

          <p>
            Manage the services offered through
            Easy Service.
          </p>
        </div>

        <button
          className="admin-primary-btn"
          onClick={openAddForm}
        >
          + Add Service
        </button>

      </div>

      {/* SERVICE STATS */}

      <div className="service-stat-grid">

        <div className="service-stat-card">
          <div className="service-stat-icon">
            🔧
          </div>

          <div>
            <strong>{services.length}</strong>
            <span>Total Services</span>
          </div>
        </div>

        <div className="service-stat-card">
          <div className="service-stat-icon">
            ✓
          </div>

          <div>
            <strong>
              {
                services.filter(
                  (service) =>
                    service.status === "active"
                ).length
              }
            </strong>

            <span>Active Services</span>
          </div>
        </div>

        <div className="service-stat-card">
          <div className="service-stat-icon">
            ⏸
          </div>

          <div>
            <strong>
              {
                services.filter(
                  (service) =>
                    service.status === "inactive"
                ).length
              }
            </strong>

            <span>Inactive Services</span>
          </div>
        </div>

        <div className="service-stat-card">
          <div className="service-stat-icon">
            📁
          </div>

          <div>
            <strong>{categories.length}</strong>
            <span>Categories</span>
          </div>
        </div>

      </div>

      {/* FILTER BAR */}

      <div className="admin-toolbar">

        <div className="admin-search">

          <span>⌕</span>

          <input
            type="text"
            placeholder="Search services..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
          />

        </div>

        <select
          value={categoryFilter}
          onChange={(e) =>
            setCategoryFilter(e.target.value)
          }
        >
          <option value="all">
            All Categories
          </option>

          {categories.map((category) => (
            <option
              key={category.id}
              value={category.name}
            >
              {category.name}
            </option>
          ))}
        </select>

        <select
          value={statusFilter}
          onChange={(e) =>
            setStatusFilter(e.target.value)
          }
        >
          <option value="all">
            All Status
          </option>

          <option value="active">
            Active
          </option>

          <option value="inactive">
            Inactive
          </option>
        </select>

        <button
          className="admin-refresh-btn"
          onClick={() => {
            setSearch("");
            setCategoryFilter("all");
            setStatusFilter("all");
          }}
        >
          ↻ Reset
        </button>

      </div>

      {/* SERVICES TABLE */}

      <div className="admin-card">

        <div className="admin-card-header service-card-header">

          <div>
            <h2>Service Management</h2>

            <p>
              {filteredServices.length} services
              found
            </p>
          </div>

          <button
            className="category-btn"
            onClick={addCategory}
          >
            + Category
          </button>

        </div>

        <AdminTable
          columns={columns}
          data={filteredServices}
          emptyMessage="No services found."
        />

      </div>

      {/* ADD / EDIT MODAL */}

      <AdminModal
        isOpen={showForm}
        title={
          editingService
            ? "Edit Service"
            : "Add New Service"
        }
        size="medium"
        onClose={() => {
          setShowForm(false);
          setEditingService(null);
          setForm(emptyForm);
        }}
      >

        <form
          className="service-form"
          onSubmit={handleSubmit}
        >

          <div className="form-group">
            <label>
              Service Name *
            </label>

            <input
              name="name"
              type="text"
              placeholder="e.g. Home Deep Cleaning"
              value={form.name}
              onChange={handleFormChange}
              required
            />
          </div>

          <div className="form-row">

            <div className="form-group">
              <label>
                Category *
              </label>

              <select
                name="category"
                value={form.category}
                onChange={handleFormChange}
                required
              >
                <option value="">
                  Select category
                </option>

                {categories.map((category) => (
                  <option
                    key={category.id}
                    value={category.name}
                  >
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>
                Starting Price *
              </label>

              <input
                name="price"
                type="number"
                min="0"
                placeholder="2500"
                value={form.price}
                onChange={handleFormChange}
                required
              />
            </div>

          </div>

          <div className="form-row">

            <div className="form-group">
              <label>
                Estimated Duration
              </label>

              <input
                name="duration"
                type="text"
                placeholder="e.g. 3 hours"
                value={form.duration}
                onChange={handleFormChange}
              />
            </div>

            <div className="form-group">
              <label>Status</label>

              <select
                name="status"
                value={form.status}
                onChange={handleFormChange}
              >
                <option value="active">
                  Active
                </option>

                <option value="inactive">
                  Inactive
                </option>
              </select>
            </div>

          </div>

          <div className="form-group">
            <label>
              Description
            </label>

            <textarea
              name="description"
              rows="5"
              placeholder="Describe this service..."
              value={form.description}
              onChange={handleFormChange}
            />
          </div>

          <div className="service-form-actions">

            <button
              type="button"
              className="form-cancel-btn"
              onClick={() => {
                setShowForm(false);
                setEditingService(null);
                setForm(emptyForm);
              }}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="admin-primary-btn"
            >
              {editingService
                ? "Save Changes"
                : "Create Service"}
            </button>

          </div>

        </form>

      </AdminModal>

      {/* DETAILS MODAL */}

      <AdminModal
        isOpen={showDetails}
        title="Service Details"
        onClose={() => {
          setShowDetails(false);
          setSelectedService(null);
        }}
      >

        {selectedService && (
          <div className="service-details">

            <div className="service-detail-icon">
              🔧
            </div>

            <h2>
              {selectedService.name}
            </h2>

            <span className="service-category">
              {selectedService.category}
            </span>

            <p className="service-detail-description">
              {selectedService.description}
            </p>

            <div className="service-detail-grid">

              <div>
                <label>Service ID</label>
                <strong>
                  #{selectedService.id}
                </strong>
              </div>

              <div>
                <label>Starting Price</label>
                <strong>
                  NPR{" "}
                  {Number(
                    selectedService.price
                  ).toLocaleString()}
                </strong>
              </div>

              <div>
                <label>Duration</label>
                <strong>
                  {selectedService.duration ||
                    "Not specified"}
                </strong>
              </div>

              <div>
                <label>Status</label>
                <strong>
                  {selectedService.status}
                </strong>
              </div>

              <div>
                <label>Created</label>
                <strong>
                  {selectedService.created_at}
                </strong>
              </div>

            </div>

          </div>
        )}

      </AdminModal>

      {/* DELETE */}

      <ConfirmDialog
        isOpen={showDelete}
        title="Delete Service?"
        message={
          selectedService
            ? `Are you sure you want to permanently delete "${selectedService.name}"?`
            : ""
        }
        confirmText="Delete Service"
        danger
        onConfirm={deleteService}
        onCancel={() => {
          setShowDelete(false);
          setSelectedService(null);
        }}
      />

    </div>
  );
}

export default Services;