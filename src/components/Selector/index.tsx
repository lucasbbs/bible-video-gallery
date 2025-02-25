import { FormDescription, FormField, FormItem, FormLabel, FormMessage } from '../ui/form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'

type SelectorProps = {
    form: any,
    options: {value: string, label: string}[],
    description?: string,
    formLabel: string
}
export default function Selector({ form, options, description, formLabel }: SelectorProps) {
  return (
    <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{formLabel}</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <SelectTrigger className='w-[280px] !border-2 border-gray-800 rounded-md'>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {options.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      { description ? description :<>&nbsp;</>}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
  )
}
