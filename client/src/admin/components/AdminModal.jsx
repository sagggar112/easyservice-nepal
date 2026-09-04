function AdminModal({
  isOpen,
  title,
  children,
  onClose,
  size = "medium",
}) {
  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="admin-modal-overlay"
      onClick={onClose}
    >
      <div
        className={`admin-modal admin-modal-${size}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="admin-modal-header">
          <h2>{title}</h2>

          <button
            className="admin-modal-close"
            onClick={onClose}
          >
            ×
          </button>
        </div>

        <div className="admin-modal-body">
          {children}
        </div>
      </div>
    </div>
  );
}

export default AdminModal;