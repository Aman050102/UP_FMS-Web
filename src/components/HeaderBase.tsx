// HeaderBase.tsx
export default function HeaderBase({
  onToggleMenu,
  displayName,
  BACKEND,
}: any) {
  return (
    <header className="header-container">
      <div className="left-section">
        <button className="btn-icon" onClick={onToggleMenu}>
          {/* SVG Code */}
        </button>
        <img src="/img/dsa.png" alt="Logo" className="logo-img" />
      </div>
      <div className="right-section">
        <span className="display-name">{displayName}</span>
        <form action={`${BACKEND}/logout/`} method="post">
          <button type="submit" className="btn-logout">
            Logout
          </button>
        </form>
      </div>
    </header>
  );
}
