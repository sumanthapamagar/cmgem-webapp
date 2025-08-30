import { memo } from 'react';
import { Controller } from 'react-hook-form';
import { Field, Label } from '../../../components';

const FormField = memo(({ 
    name, 
    control, 
    rules, 
    label, 
    children, 
    error, 
    required = false 
}) => {
    return (
        <div className="flex items-start">
            <Field className='w-full flex gap-4'>
                <Label className={`w-32 pt-2 text-sm font-medium ${required ? 'text-red-500' : ''}`}>
                    {label} {required && '*'}
                </Label>
                <div className="w-full">
                    <Controller
                        name={name}
                        control={control}
                        rules={rules}
                        render={({ field }) => (
                            <>
                                {typeof children === 'function' ? children(field) : children}
                                {error && (
                                    <p className="text-red-500 text-sm mt-1">{error}</p>
                                )}
                            </>
                        )}
                    />
                </div>
            </Field>
        </div>
    );
});

FormField.displayName = 'FormField';

export default FormField;
