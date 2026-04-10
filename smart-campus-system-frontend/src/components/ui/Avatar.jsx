export default function Avatar({
  name = '',
  size = 'md',
  color = 'green',
  imageUrl = '',
}) {
  const initials = name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const sizes = {
    sm: 'w-7 h-7 text-xs',
    md: 'w-9 h-9 text-sm',
    lg: 'w-11 h-11 text-base',
  };

  const colors = {
    green: 'bg-[#E1F5EE] text-[#0F6E56]',
    purple: 'bg-[#EEEDFE] text-[#534AB7]',
    amber: 'bg-[#FAEEDA] text-[#854F0B]',
    blue: 'bg-[#E6F1FB] text-[#185FA5]',
  };

  return (
    <div
      className={`rounded-full flex items-center justify-center overflow-hidden font-medium flex-shrink-0 ${sizes[size]} ${colors[color]}`}
    >
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={name || 'Profile'}
          className="h-full w-full object-cover"
        />
      ) : (
        initials || '?'
      )}
    </div>
  );
}
