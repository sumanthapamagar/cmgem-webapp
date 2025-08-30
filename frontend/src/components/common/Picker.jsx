import { Button, Combobox, ComboboxInput, ComboboxOption, ComboboxOptions, Label } from '@headlessui/react';
import { Stack } from '../layout/Stack';
export function Picker({
    onChange,
    options,
    label,
    disabled,
    selected,
    placehoder = '',
    onSelect
}) {
    return (
        <Combobox value={selected} by="_id" onChange={onSelect}>
            <Stack horizontal className="gap-6 relative max-w-[800px]">
                {label && <Label className=" block font-medium text-gray-700">
                    {label}
                </Label>}
                <div className="relative w-full z-10">
                    {!selected ? (
                        <ComboboxInput
                            className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-xs ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 "
                            onChange={(event) => onChange(event.target.value)}
                            displayValue={(option) => option?.text}
                            placeholder={placehoder}
                            disabled={!!selected || disabled}
                        />
                    ) : (
                        <div className='bg-slate-100 rounded-sm p-2'>{selected?.text}</div>
                    )}
                    {!!selected && !disabled && (
                        <Button
                            className="absolute inset-y-0 right-0 flex items-center pr-2 disabled:opacity-50"
                            onClick={() => onSelect(null)}
                            disabled={disabled}
                        >
                            <i className="fa-solid fa-xmark"></i>
                        </Button>
                    )}
                    <ComboboxOptions className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-hidden">
                        {options?.map((option) => (
                            <ComboboxOption
                                key={option.key}
                                value={option}
                                className="ui-active:bg-blue-500 ui-active:text-white hover:bg-indigo-600 hover:text-white p-2 pl-10"
                            >
                                {({ selected }) => (
                                    <>
                                        {selected ? (
                                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-emerald-500">
                                                <i className="fa-fw fa-solid fa-check" />
                                            </span>
                                        ) : null}
                                        <span className="block truncate">
                                            {option.text}
                                        </span>
                                    </>
                                )}
                            </ComboboxOption>
                        ))}
                    </ComboboxOptions>
                </div>
            </Stack>
        </Combobox>
    );
}
