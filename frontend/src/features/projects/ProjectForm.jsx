import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { useState, useEffect } from 'react';

import { Input, Picker, Stack, Fieldset, Field, Label, Legend, Button, Checkbox, CheckboxField } from '../../components';
import { getAccounts } from '../../lib/api';

const ProjectForm = ({ 
    onSubmit, 
    isPending = false, 
    isOnline = true, 
    hasLocalChanges = false,
    defaultValues = {},
    children = null
}) => {
    const [selectedAccount, setSelectedAccount] = useState(defaultValues.account ? {
        _id: defaultValues.account._id,
        name: defaultValues.account.name,
        key: defaultValues.account._id,
        text: defaultValues.account.name
    } : null);

    const { mutate: findAccount, data: accountsData } = useMutation({
        mutationFn: (q) => getAccounts(q),
        initialData: []
    });

    const options = accountsData?.map((acc) => ({
        ...acc,
        key: acc._id,
        text: acc.name
    }));

    const { register, handleSubmit, formState: { errors }, setValue, watch, setError, clearErrors } = useForm({
        defaultValues: {
            name: '',
            category: '',
            address: {
                street_1: '',
                street_2: '',
                city: '',
                post_code: '',
                state: '',
                country: ''
            },
            inspection_date: '',
            account_id: '',
            is_test: false,
            ...defaultValues
        }
    });

    const handleAccountSelect = (account) => {
        setSelectedAccount(account);
        // Clear the account_id error when an account is selected
        if (account && account._id) {
            clearErrors('account_id');
        }
    };

    // Clear account_id error if there's a default account (for edit mode)
    useEffect(() => {
        if (selectedAccount && selectedAccount._id) {
            clearErrors('account_id');
        }
    }, [selectedAccount, clearErrors]);

    const handleFormSubmit = (data) => {
        // Prevent resubmission if already processing
        if (isPending) {
            return;
        }
        
        // Check if account_id is empty or null and set form error
        if (!selectedAccount || !selectedAccount._id) {
            setValue('account_id', '', { shouldValidate: true });
            setError('account_id', {
                type: 'manual',
                message: 'Please select a customer account before saving the project.'
            });
            return;
        }

        onSubmit({
            ...data,
            account_id: selectedAccount._id
        });
    };

    return (
        <form onSubmit={handleSubmit(handleFormSubmit)} className={`${isPending ? 'opacity-75' : ''}`}>
            <Stack className="gap-4 px-8 py-2">
                {isPending && (
                    <div className="absolute inset-0 bg-white/50 flex items-center justify-center z-10">
                        <div className="bg-white rounded-lg p-4 shadow-lg border">
                            <div className="flex items-center gap-3">
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                                <span className="text-gray-700">Updating project...</span>
                            </div>
                        </div>
                    </div>
                )}
                
                <Fieldset className="flex flex-col gap-2">
                    <Legend>Project Information</Legend>
                    <Field>
                        <div className="flex items-center gap-6">
                            <Label className="w-40 shrink-0">Project/Building Name *</Label>
                            <div className="flex-1">
                                <Input
                                    {...register('name', { required: 'Project name is required' })}
                                    placeholder="Enter project or building name"
                                    className={`${errors.name ? 'border-red-500' : ''} ${!isOnline ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                                    disabled={!isOnline || hasLocalChanges}
                                />
                                {errors.name && (
                                    <span className="text-red-500 text-sm mt-1">{errors.name.message}</span>
                                )}
                            </div>
                        </div>
                    </Field>
                    <Field>
                        <div className="flex items-center gap-6">
                            <Label className="w-40 shrink-0">Building Type *</Label>
                            <div className="flex-1">
                                <Input
                                    {...register('category', { required: 'Building type is required' })}
                                    placeholder="Enter building type"
                                    className={`${errors.category ? 'border-red-500' : ''} ${!isOnline ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                                    disabled={!isOnline || hasLocalChanges}
                                />
                                {errors.category && (
                                    <span className="text-red-500 text-sm mt-1">{errors.category.message}</span>
                                )}
                            </div>
                        </div>
                    </Field>
                </Fieldset>

                <Fieldset className="flex flex-col gap-2">
                    <Legend>Address</Legend>
                    <Field>
                        <div className="flex items-center gap-6">
                            <Label className="w-40 shrink-0">Street 1 *</Label>
                            <div className="flex-1">
                                <Input
                                    {...register('address.street_1', { required: 'Street address is required' })}
                                    placeholder="Enter street address"
                                    className={`${errors.address?.street_1 ? 'border-red-500' : ''} ${!isOnline ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                                    disabled={!isOnline || hasLocalChanges}
                                />
                                {errors.address?.street_1 && (
                                    <span className="text-red-500 text-sm mt-1">{errors.address.street_1.message}</span>
                                )}
                            </div>
                        </div>
                    </Field>
                    <Field>
                        <div className="flex items-center gap-6">
                            <Label className="w-40 shrink-0">Street 2</Label>
                            <div className="flex-1">
                                <Input
                                    {...register('address.street_2')}
                                    placeholder="Enter additional address info"
                                    className={`${!isOnline ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                                    disabled={!isOnline || hasLocalChanges}
                                />
                            </div>
                        </div>
                    </Field>
                    <Field>
                        <div className="flex items-center gap-6">
                            <Label className="w-40 shrink-0">City/Suburb *</Label>
                            <div className="flex-1">
                                <Input
                                    {...register('address.city', { required: 'City is required' })}
                                    placeholder="Enter city or suburb"
                                    className={`${errors.address?.city ? 'border-red-500' : ''} ${!isOnline ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                                    disabled={!isOnline || hasLocalChanges}
                                />
                                {errors.address?.city && (
                                    <span className="text-red-500 text-sm mt-1">{errors.address.city.message}</span>
                                )}
                            </div>
                        </div>
                    </Field>
                    <Field>
                        <div className="flex items-center gap-6">
                            <Label className="w-40 shrink-0">Post Code *</Label>
                            <div className="flex-1">
                                <Input
                                    {...register('address.post_code', { required: 'Post code is required' })}
                                    placeholder="Enter post code"
                                    className={`${errors.address?.post_code ? 'border-red-500' : ''} ${!isOnline ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                                    disabled={!isOnline || hasLocalChanges}
                                />
                                {errors.address?.post_code && (
                                    <span className="text-red-500 text-sm mt-1">{errors.address.post_code.message}</span>
                                )}
                            </div>
                        </div>
                    </Field>
                    <Field>
                        <div className="flex items-center gap-6">
                            <Label className="w-40 shrink-0">State *</Label>
                            <div className="flex-1">
                                <Input
                                    {...register('address.state', { required: 'State is required' })}
                                    placeholder="Enter state"
                                    className={`${errors.address?.state ? 'border-red-500' : ''} ${!isOnline ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                                    disabled={!isOnline || hasLocalChanges}
                                />
                                {errors.address?.state && (
                                    <span className="text-red-500 text-sm mt-1">{errors.address.state.message}</span>
                                )}
                            </div>
                        </div>
                    </Field>
                    <Field>
                        <div className="flex items-center gap-6">
                            <Label className="w-40 shrink-0">Country *</Label>
                            <div className="flex-1">
                                <Input
                                    {...register('address.country', { required: 'Country is required' })}
                                    placeholder="Enter country"
                                    className={`${errors.address?.country ? 'border-red-500' : ''} ${!isOnline ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                                    disabled={!isOnline || hasLocalChanges}
                                />
                                {errors.address?.country && (
                                    <span className="text-red-500 text-sm mt-1">{errors.address.country.message}</span>
                                )}
                            </div>
                        </div>
                    </Field>
                </Fieldset>

                <Fieldset className="flex flex-col gap-2">
                    <Legend>Project Details</Legend>
                    <Field>
                        <div className="flex items-center gap-6">
                            <Label className="w-40 shrink-0">Inspection Date *</Label>
                            <div className="flex-1">
                                <Input
                                    type="date"
                                    {...register('inspection_date', { required: 'Inspection date is required' })}
                                    className={`${errors.inspection_date ? 'border-red-500' : ''} ${!isOnline ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                                    disabled={!isOnline || hasLocalChanges}
                                />
                                {errors.inspection_date && (
                                    <span className="text-red-500 text-sm mt-1">{errors.inspection_date.message}</span>
                                )}
                            </div>
                        </div>
                    </Field>

                    <Field>
                        <div className="flex items-center gap-6">
                            <Label className="w-40 shrink-0">Customer Account *</Label>
                            <div className="flex-1">
                                <Picker
                                    placeholder="Type Account name to search"
                                    options={options}
                                    disabled={!isOnline || hasLocalChanges}
                                    onChange={findAccount}
                                    selected={selectedAccount}
                                    onSelect={handleAccountSelect}
                                />
                                {errors.account_id && (
                                    <span className="text-red-500 text-sm mt-1">{errors.account_id.message}</span>
                                )}
                            </div>
                        </div>
                    </Field>
                    {/* <CheckboxField>
                        <div className="flex items-center gap-6">
                            <Label className="w-40 shrink-0">Test Project</Label>
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="is_test"
                                    {...register('is_test')}
                                    checked={watch('is_test')}
                                    onCheckedChange={(checked) => setValue('is_test', checked)}
                                    disabled={!isOnline || hasLocalChanges}
                                    className={`${!isOnline ? 'opacity-50 cursor-not-allowed' : ''}`}
                                />
                                <Label htmlFor="is_test" className="text-sm font-normal w-96">
                                    Mark this as a test project
                                </Label>
                            </div>
                        </div>
                    </CheckboxField> */}
                </Fieldset>

                {children}
            </Stack>

        </form>
    );
};

export default ProjectForm;
