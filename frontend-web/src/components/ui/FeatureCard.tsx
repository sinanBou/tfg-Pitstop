interface FeatureCardProps {
  title: string;
  description: string;
  borderColor: 'red' | 'blue'; // Limitamos los colores a los de tu tema
  alignment?: 'left' | 'right';
}

export default function FeatureCard({ title, description, borderColor, alignment = 'left' }: FeatureCardProps) {
  // Clases dinámicas según el color y alineación
  const borderClass = borderColor === 'red' ? 'border-l-4 border-red-600' : 'border-r-4 border-blue-500';
  const alignClass = alignment === 'right' ? 'md:text-right' : '';

  return (
    <div className={`bg-neutral-900 p-6 rounded-xl ${borderClass} ${alignClass} hover:bg-neutral-800 transition-colors`}>
      <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
      <p className="text-gray-400 text-sm">
        {description}
      </p>
    </div>
  );
}