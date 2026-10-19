export default function Wordmark({ nameEn }: { nameEn: string }) {
  const [first, ...rest] = (nameEn || "Entaliq Energy").trim().split(/\s+/);
  return (
    <>
      <img className="logo-img" src="/brand-mark.svg" width={44} height={44} alt="" />
      <span><b>{first.toUpperCase()}</b>{rest.length > 0 && <small>{rest.join(" ").toUpperCase()}</small>}</span>
    </>
  );
}
