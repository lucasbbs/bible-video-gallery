import {
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

type SelectorProps = {
  form: any;
  options: { value: string; label: string }[];
  description?: string;
  formLabel: string;
  onChange?: (value: string) => void;
  value?: string;
  placeholder?: string;
};
export default function Selector({
  form,
  value,
  options,
  description,
  formLabel,
  onChange,
  placeholder,
}: SelectorProps) {
  return (
    <FormField
      control={form.control}
      name="email"
      render={({ field }) => (
        <FormItem>
          <FormLabel>{formLabel}</FormLabel>
          <Select onValueChange={onChange ?? field.onChange} value={value}>
            <SelectTrigger className="w-[280px] !border-2 border-gray-800 rounded-md">
              <SelectValue placeholder={placeholder ?? "Select"} />
            </SelectTrigger>
            <SelectContent position="item-aligned">
              {options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormDescription>
            {description ? description : <>&nbsp;</>}
          </FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
