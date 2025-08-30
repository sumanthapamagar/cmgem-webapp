import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';

import { Button, Input, Textarea, Fieldset, Field, Label, Legend, Stack } from '../../../components';
import { createAccount } from '../../../lib/api';

export default function NewAccount() {
    const navigate = useNavigate();

    const { register, handleSubmit, formState: { errors } } = useForm({
        defaultValues: {
            name: '',
            description: '',
            address: {
                street_1: '',
                street_2: '',
                city: '',
                post_code: '',
                state: '',
                country: ''
            },
            phone: '',
            fax: '',
            website: ''
        },
        mode: 'onBlur'
    });

    const { mutate, isPending } = useMutation({
        mutationFn: createAccount,
        onSuccess: res => navigate(`/accounts/${res.account._id}`)
    });

    const onSubmit = (data) => {
        mutate(data);
    };
    return (
        <form onSubmit={handleSubmit(onSubmit)} className="p-2 sm:p-4 lg:p-8">
            <Stack className="gap-2">
                <Fieldset className="flex flex-col gap-2">
                    <Legend>Account Information</Legend>
                    <Field>
                        <div className="flex items-start gap-6">
                            <Label className="w-32 shrink-0">Account Name *</Label>
                            <div className="flex-1">
                                <Input
                                    {...register('name', { required: 'Account name is required' })}
                                    placeholder="Enter account name"
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
                                    placeholder="Enter account description"
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
                                    placeholder="Enter street address"
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
                                    placeholder="Enter additional address info"
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
                                    placeholder="Enter city or suburb"
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
                                    placeholder="Enter post code"
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
                                    placeholder="Enter state"
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
                                    placeholder="Enter country"
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
                                    placeholder="Enter phone number"
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
                                    placeholder="Enter fax number"
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
                                    placeholder="Enter website URL"
                                />
                            </div>
                        </div>
                    </Field>
                </Fieldset>

                <div className="flex justify-end pt-4">
                    <Button type="submit" disabled={isPending}>
                        {isPending ? 'Creating...' : 'Create Account'}
                    </Button>
                </div>
            </Stack>
        </form>
    );
}
