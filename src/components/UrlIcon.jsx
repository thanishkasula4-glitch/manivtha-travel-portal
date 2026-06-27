const ICON_BASE_URL = "https://api.iconify.design/material-symbols";

export default function UrlIcon({ name, size = 24, color = "#0d1b2a", alt = "" }) {
  const src = `${ICON_BASE_URL}/${name}.svg?color=${encodeURIComponent(color)}`;

  return (
    <img
      src={src}
      alt={alt}
      width={size}
      height={size}
      aria-hidden={alt ? undefined : true}
      style={{ display: "block", objectFit: "contain" }}
    />
  );
}
