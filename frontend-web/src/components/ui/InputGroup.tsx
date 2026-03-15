// src/components/ui/InputGroup.tsx

interface InputGroupProps {
  label: string;
  name: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  placeholder?: string;
  // Añadimos maxLength opcional
  maxLength?: number; 
}

export default function InputGroup({ 
  label, name, type = "text", value, onChange, error, placeholder, maxLength 
}: InputGroupProps) {
  return (
    <div className="w-full relative group">
      <label className="block text-neutral-400 text-[10px] font-black uppercase tracking-widest mb-1.5 ml-1 transition-colors group-hover:text-neutral-300">
        {label}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        maxLength={maxLength}
        className={`w-full bg-neutral-900/50 backdrop-blur-sm rounded-xl p-4 text-white font-medium outline-none transition-all placeholder-neutral-600 border ${
          error ? 'border-red-500 focus:border-red-500 focus:bg-red-500/5' : 'border-neutral-800 hover:border-neutral-700 focus:border-white focus:bg-black/80 shadow-md shadow-transparent focus:shadow-[0_0_20px_rgba(255,255,255,0.05)]'
        }`}
      />
      {error && <p className="text-red-500 text-[10px] mt-1.5 ml-1 font-black uppercase tracking-widest animate-fade-in">{error}</p>}
    </div>
  );
}