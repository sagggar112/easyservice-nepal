function LoadingSpinner({ text = "Loading..." }) {
  return (
    <div className="admin-loading">
      <div className="admin-spinner"></div>
      <p>{text}</p>
    </div>
  );
}

export default LoadingSpinner;