import { formatCurrencyInput, parseCurrencyInput } from "@/lib/format";
import { Input } from "@/components/ui/input";

interface CurrencyInputProps {
  value: number;
  onChange: (value: number) => void;
  autoFocus?: boolean;
  id?: string;
}

export function CurrencyInput({ value, onChange, autoFocus, id }: CurrencyInputProps) {
  return (
    <Input
      id={id}
      inputMode="numeric"
      autoFocus={autoFocus}
      value={formatCurrencyInput(value)}
      onChange={(event) => onChange(parseCurrencyInput(event.target.value))}
    />
  );
}
