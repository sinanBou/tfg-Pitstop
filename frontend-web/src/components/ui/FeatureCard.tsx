interface FeatureCardProps {
  title: string;
  description: string;
  borderColor: 'red' | 'blue'; // Limitamos los colores a los de tu tema
  alignment?: 'left' | 'right';
}

export default function FeatureCard({ title, description, borderColor, alignment = 'left' }: FeatureCardProps) {
  const borderClass = borderColor === 'red' ? 'border-red-600/50 group-hover:border-red-500' : 'border-blue-500/50 group-hover:border-blue-500';
  const shadowClass = borderColor === 'red' ? 'group-hover:shadow-[0_0_30px_rgba(220,38,38,0.15)]' : 'group-hover:shadow-[0_0_30px_rgba(59,130,246,0.15)]';
  const glowClass = borderColor === 'red' ? 'bg-red-500/10' : 'bg-blue-500/10';
  const textClass = borderColor === 'red' ? 'group-hover:text-red-400' : 'group-hover:text-blue-400';
  const alignClass = alignment === 'right' ? 'md:text-right' : '';

  return (
    <div className={`relative group p-8 rounded-3xl bg-neutral-900/40 backdrop-blur-md border border-neutral-800 ${alignClass} hover:bg-neutral-900/60 transition-all duration-500 overflow-hidden ${shadowClass}`}>
      <div className={`absolute top-0 ${alignment === 'right' ? 'right-0' : 'left-0'} w-2 h-full ${borderClass} border-l-[4px] opacity-80 group-hover:opacity-100 transition-opacity`} />
      <div className={`absolute top-0 ${alignment === 'right' ? 'right-0' : 'left-0'} w-1/2 h-full ${glowClass} blur-3xl opacity-0 group-hover:opacity-40 transition-opacity duration-700 pointer-events-none`} />
      
      <div className="relative z-10">
        <h3 className={`text-2xl font-black italic uppercase text-white mb-3 transition-colors ${textClass}`}>{title}</h3>
        <p className="text-neutral-400 text-sm leading-relaxed font-medium">
          {description}
        </p>
      </div>
    </div>
  );
}