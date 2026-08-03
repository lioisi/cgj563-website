export default function SectionHeader({ eyebrow, title, description }) {
  return (
    <header className="section-header-block">
      {eyebrow && <p className="section-eyebrow">{eyebrow}</p>}
      <h1>{title}</h1>
      {description && <p className="section-description">{description}</p>}
    </header>
  );
}
