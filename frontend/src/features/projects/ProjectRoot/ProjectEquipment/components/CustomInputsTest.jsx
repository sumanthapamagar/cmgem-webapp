import React from 'react';
import { CustomTextField, CustomTextArea, CustomCheckbox, CustomSelect } from './CustomInputs';

export default function CustomInputsTest() {
    const handleSave = (fieldPath, value) => {
        console.log('Test save:', fieldPath, value);
    };

    return (
        <div className="p-4 space-y-4">
            <h2 className="text-xl font-bold">Custom Inputs Test</h2>
            
            <div>
                <label className="block text-sm font-medium mb-2">Text Field Test:</label>
                <CustomTextField
                    fieldPath="test.textField"
                    defaultValue="Initial value"
                    placeholder="Type here..."
                    className="w-full px-3 py-2 border rounded"
                    onSave={handleSave}
                />
            </div>

            <div>
                <label className="block text-sm font-medium mb-2">Text Area Test:</label>
                <CustomTextArea
                    fieldPath="test.textArea"
                    defaultValue="Initial text area value"
                    placeholder="Type here..."
                    rows={3}
                    className="w-full px-3 py-2 border rounded"
                    onSave={handleSave}
                />
            </div>

            <div>
                <label className="block text-sm font-medium mb-2">Select Test:</label>
                <CustomSelect
                    fieldPath="test.select"
                    defaultValue="option1"
                    options={[
                        { value: 'option1', label: 'Option 1' },
                        { value: 'option2', label: 'Option 2' },
                        { value: 'option3', label: 'Option 3' }
                    ]}
                    className="w-full px-3 py-2 border rounded"
                    onSave={handleSave}
                />
            </div>

            <div>
                <label className="block text-sm font-medium mb-2">Checkbox Tests:</label>
                <div className="space-y-2">
                    <CustomCheckbox
                        fieldPath="test.checkbox1"
                        defaultValue={false}
                        label="Checkbox 1"
                        onSave={handleSave}
                    />
                    <CustomCheckbox
                        fieldPath="test.checkbox2"
                        defaultValue={true}
                        label="Checkbox 2"
                        onSave={handleSave}
                    />
                </div>
            </div>

            <div className="mt-6 p-4 bg-gray-100 rounded">
                <h3 className="font-semibold mb-2">Test Instructions:</h3>
                <ol className="list-decimal list-inside space-y-1 text-sm">
                    <li>Type in the text field - should see orange border when dirty</li>
                    <li>Wait 600ms (200ms debounce + 400ms idle) - should see save log</li>
                    <li>Type in text area - should see orange border when dirty</li>
                    <li>Wait 1500ms (500ms debounce + 1000ms idle) - should see save log</li>
                    <li>Change select - should see orange border and quick save (300ms total)</li>
                    <li>Click checkboxes - should save immediately</li>
                </ol>
            </div>
        </div>
    );
}
