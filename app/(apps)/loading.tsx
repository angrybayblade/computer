export default function AppLoading() {
  return (
    <div
      role="status"
      style={{
        height: "100%",
        display: "grid",
        placeItems: "center",
        background: "var(--color-bauhaus-white)",
        color: "var(--color-bauhaus-black)",
        fontSize: 12,
        fontWeight: 700,
        letterSpacing: "0.12em",
        textTransform: "uppercase",
      }}
    >
      Loading…
    </div>
  );
}
