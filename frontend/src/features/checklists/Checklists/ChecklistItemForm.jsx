import { Select, Textarea, Stack, Button, Input, ChecklistLoadingState } from '../../../components';
import locationCategories from '../../../constants/locationCategories';
import { useParams } from 'react-router-dom';
import { useChecklistForm } from './useChecklistForm';
import FormField from './FormField';

function ChecklistItemForm({ id = null, onCancel, onSaveSuccess }) {
    const { equipmentType, location } = useParams();
    
    const {
        control,
        handleSubmit,
        onSubmit,
        errors,
        isSubmitting,
        isValid,
        isLoading,
        queryError,
        mutationError
    } = useChecklistForm(id, onSaveSuccess);

    const handleFormSubmit = (data) => {
        onSubmit({
            ...data,
            equipment_type: equipmentType,
            location
        });
    };
    if (isLoading)
        return (
            <ChecklistLoadingState />
        );
    return (
        <form onSubmit={handleSubmit(handleFormSubmit)}>
            <Stack className='w-full m-4 gap-4'>
                {/* Error Messages */}
                {(queryError || mutationError) && (
                    <div className="bg-red-50 border border-red-200 rounded-md p-4">
                        <p className="text-red-800 text-sm">
                            {queryError?.message || mutationError?.message || 'An error occurred'}
                        </p>
                    </div>
                )}
                <FormField
                    name="title"
                    control={control}
                    label="Title"
                    required
                    rules={{ 
                        required: 'Title is required',
                        minLength: {
                            value: 3,
                            message: 'Title must be at least 3 characters'
                        }
                    }}
                    error={errors.title?.message}
                >
                    {(field) => (
                        <Input
                            {...field}
                            placeholder="Enter checklist item title"
                            className="w-full"
                        />
                    )}
                </FormField>

                <FormField
                    name="description"
                    control={control}
                    label="Description"
                >
                    {(field) => (
                        <Textarea
                            {...field}
                            rows={3}
                            placeholder="Enter checklist item description"
                            className="w-full"
                        />
                    )}
                </FormField>

                <FormField
                    name="category"
                    control={control}
                    label="Item Category"
                    required
                    rules={{
                        required: 'At least one category is required',
                        validate: (value) => 
                            Array.isArray(value) && value.length > 0 
                                ? true 
                                : 'Please select at least one category'
                    }}
                    error={errors.category?.message}
                >
                    {(field) => (
                        <div className="w-full">
                            <select
                                className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 ${
                                    errors.category 
                                        ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' 
                                        : 'border-zinc-950/10 focus:border-blue-500 focus:ring-blue-500/20'
                                }`}
                                value={field.value}
                                onChange={(e) => {
                                    const selectedValues = Array.from(e.target.selectedOptions, option => option.value);
                                    field.onChange(selectedValues);
                                }}
                                multiple
                                size={4}
                            >
                                {locationCategories.map((category) => (
                                    <option key={category.key} value={category.text}>
                                        {category.text}
                                    </option>
                                ))}
                            </select>
                            <p className="text-xs text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple options</p>
                        </div>
                    )}
                </FormField>

                <Stack horizontal className="justify-end gap-4 mt-8">
                    <Button 
                        type="submit" 
                        disabled={isSubmitting || !isValid}
                        loading={isSubmitting ? true : undefined}
                    >
                        {!id ? 'Create' : 'Save'}
                    </Button>
                    <Button 
                        type="button" 
                        onClick={onCancel} 
                        variant="outline"
                        disabled={isSubmitting}
                    >
                        Cancel
                    </Button>
                </Stack>
            </Stack>
        </form>
    );
}

export default ChecklistItemForm;
