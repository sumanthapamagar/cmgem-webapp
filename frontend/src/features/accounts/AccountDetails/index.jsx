import { useForm } from 'react-hook-form';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { useState } from 'react';

import { getAccount, saveAccount } from '../../../lib/api';
import { Stack, Input, Textarea, Fieldset, Field, Label, Legend, Button, AccountLoadingState, Alert } from '../../../components';

export default function AccountDetail() {
    const params = useParams();
    const { accountId } = params;
    const [submitStatus, setSubmitStatus] = useState({ type: '', message: '' });

    const { data: accountData, isLoading } = useQuery({
        queryKey: ['account', accountId],
        queryFn: () => getAccount(accountId)
    });

    const { mutate, isPending } = useMutation({
        mutationFn: (data) => saveAccount({ accountId, data }),
        onSuccess: () => {
            setSubmitStatus({ type: 'success', message: 'Account details saved successfully!' });
            // Clear success message after 5 seconds
            setTimeout(() => setSubmitStatus({ type: '', message: '' }), 5000);
        },
        onError: (error) => {
            setSubmitStatus({ 
                type: 'error', 
                message: error?.message || 'Failed to save account details. Please try again.' 
            });
            // Clear error message after 8 seconds
            setTimeout(() => setSubmitStatus({ type: '', message: '' }), 8000);
        }
    });

    const { register, handleSubmit, formState: { errors } } = useForm({
        defaultValues: accountData || {},
        mode: 'onBlur'
    });

    const onSubmit = (data) => {
        setSubmitStatus({ type: '', message: '' }); // Clear previous status
        mutate(data);
    };

    if (!accountData || isLoading)
        return (
            <AccountLoadingState />
        );

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="p-2 sm:p-4 lg:p-8">
            <Stack className="gap-2">
                {/* Status Messages */}
                {submitStatus.message && (
                    <Alert
                        open={submitStatus.message !== ''}
                        onClose={() => setSubmitStatus({ type: '', message: '' })}  
                        variant={submitStatus.type === 'success' ? 'success' : 'error'}
                        className="mb-4"
                    >
                        {submitStatus.message}
                    </Alert>
                )}

                <Fieldset className="flex flex-col gap-2">
                    <Legend>Account Information</Legend>
                    <Field>
                        <div className="flex items-start gap-6">
                            <Label className="w-32 shrink-0">Account Name *</Label>
                            <div className="flex-1">
                                <Input
                                    {...register('name', { required: 'Account name is required' })}
                                    defaultValue={accountData.name}
                                    className={errors.name ? 'border-red-500' : ''}
                                />
                                {errors.name && (
                                    <span className="text-red-500 text-sm mt-1">{errors.name.message}</span>
                                )}
                            </div>
                        </div>
                    </Field>
                    <Field>
                        <div className="flex items-start gap-6">
                            <Label className="w-32 shrink-0">Description</Label>
                            <div className="flex-1">
                                <Textarea
                                    rows={2}
                                    {...register('description')}
                                    defaultValue={accountData.description}
                                />
                            </div>
                        </div>
                    </Field>
                </Fieldset>

                <Fieldset className="flex flex-col gap-2">
                    <Legend>Address</Legend>
                    <Field>
                        <div className="flex items-start gap-6">
                            <Label className="w-32 shrink-0">Street 1 *</Label>
                            <div className="flex-1">
                                <Input
                                    {...register('address.street_1', { required: 'Street address is required' })}
                                    defaultValue={accountData.address?.street_1}
                                    className={errors.address?.street_1 ? 'border-red-500' : ''}
                                />
                                {errors.address?.street_1 && (
                                    <span className="text-red-500 text-sm mt-1">{errors.address.street_1.message}</span>
                                )}
                            </div>
                        </div>
                    </Field>
                    <Field>
                        <div className="flex items-start gap-6">
                            <Label className="w-32 shrink-0">Street 2</Label>
                            <div className="flex-1">
                                <Input
                                    {...register('address.street_2')}
                                    defaultValue={accountData.address?.street_2}
                                />
                            </div>
                        </div>
                    </Field>
                    <Field>
                        <div className="flex items-start gap-6">
                            <Label className="w-32 shrink-0">City/Suburb *</Label>
                            <div className="flex-1">
                                <Input
                                    {...register('address.city', { required: 'City is required' })}
                                    defaultValue={accountData.address?.city}
                                    className={errors.address?.city ? 'border-red-500' : ''}
                                />
                                {errors.address?.city && (
                                    <span className="text-red-500 text-sm mt-1">{errors.address.city.message}</span>
                                )}
                            </div>
                        </div>
                    </Field>
                    <Field>
                        <div className="flex items-start gap-6">
                            <Label className="w-32 shrink-0">Post Code *</Label>
                            <div className="flex-1">
                                <Input
                                    {...register('address.post_code', { required: 'Post code is required' })}
                                    defaultValue={accountData.address?.post_code}
                                    className={errors.address?.post_code ? 'border-red-500' : ''}
                                />
                                {errors.address?.post_code && (
                                    <span className="text-red-500 text-sm mt-1">{errors.address.post_code.message}</span>
                                )}
                            </div>
                        </div>
                    </Field>
                    <Field>
                        <div className="flex items-start gap-6">
                            <Label className="w-32 shrink-0">State *</Label>
                            <div className="flex-1">
                                <Input
                                    {...register('address.state', { required: 'State is required' })}
                                    defaultValue={accountData.address?.state}
                                    className={errors.address?.state ? 'border-red-500' : ''}
                                />
                                {errors.address?.state && (
                                    <span className="text-red-500 text-sm mt-1">{errors.address.state.message}</span>
                                )}
                            </div>
                        </div>
                    </Field>
                    <Field>
                        <div className="flex items-start gap-6">
                            <Label className="w-32 shrink-0">Country *</Label>
                            <div className="flex-1">
                                <Input
                                    {...register('address.country', { required: 'Country is required' })}
                                    defaultValue={accountData.address?.country}
                                    className={errors.address?.country ? 'border-red-500' : ''}
                                />
                                {errors.address?.country && (
                                    <span className="text-red-500 text-sm mt-1">{errors.address.country.message}</span>
                                )}
                            </div>
                        </div>
                    </Field>
                </Fieldset>

                <Fieldset className="flex flex-col gap-2">
                    <Legend>Contact Information</Legend>
                    <Field>
                        <div className="flex items-start gap-6">
                            <Label className="w-32 shrink-0">Phone</Label>
                            <div className="flex-1">
                                <Input
                                    type="tel"
                                    {...register('phone')}
                                    defaultValue={accountData.phone}
                                />
                            </div>
                        </div>
                    </Field>
                    <Field>
                        <div className="flex items-start gap-6">
                            <Label className="w-32 shrink-0">Fax</Label>
                            <div className="flex-1">
                                <Input
                                    type="tel"
                                    {...register('fax')}
                                    defaultValue={accountData.fax}
                                />
                            </div>
                        </div>
                    </Field>
                    <Field>
                        <div className="flex items-start gap-6">
                            <Label className="w-32 shrink-0">Website</Label>
                            <div className="flex-1">
                                <Input
                                    type="url"
                                    {...register('website')}
                                    defaultValue={accountData.website}
                                />
                            </div>
                        </div>
                    </Field>
                </Fieldset>

                <div className="flex justify-end pt-4">
                    <Button type="submit" disabled={isPending}>
                        {isPending ? 'Saving...' : 'Save Account Details'}
                    </Button>
                </div>
            </Stack>
        </form>
    );
}
