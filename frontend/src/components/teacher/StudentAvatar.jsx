// Avatar colour palette — seeded deterministically
const PALETTE = [
  '#1E3A5F','#3F8F5F','#6B48A2','#2E7D8E',
  '#A0522D','#1E6B5F','#7B3F8F','#2E5EA0',
  '#8F5F1E','#3F5F8F','#6B3A2E','#2E8F5F',
];

function colorFromId(id) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = id.charCodeAt(i) + ((hash << 5) - hash);
  return PALETTE[Math.abs(hash) % PALETTE.length];
}

/**
 * StudentAvatar
 * Props: name, initial, avatarColor, id, size ('sm'|'md'|'lg'|'xl')
 */
export default function StudentAvatar({ name, initial, avatarColor, id = '', size = 'md' }) {
  const color = avatarColor || colorFromId(id || name || 'X');
  const initials = initial || (name ? name.split(' ').map((w) => w[0]).join('').slice(0, 2) : '?');

  const sizeStyle = {
    sm:  { width: 30, height: 30, fontSize: 11 },
    md:  { width: 38, height: 38, fontSize: 13 },
    lg:  { width: 50, height: 50, fontSize: 17 },
    xl:  { width: 64, height: 64, fontSize: 22 },
  }[size] || { width: 38, height: 38, fontSize: 13 };

  return (
    <div
      aria-label={`${name || 'Student'} avatar`}
      title={name}
      style={{
        ...sizeStyle,
        borderRadius: '50%',
        background: color,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff',
        fontWeight: 700,
        fontFamily: 'var(--font-ui)',
        flexShrink: 0,
        userSelect: 'none',
        letterSpacing: '0.02em',
      }}
    >
      {initials.toUpperCase()}
    </div>
  );
}
