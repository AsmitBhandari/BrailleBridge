import React from 'react'
import { Label } from '../ui/label'
import { Textarea } from '../ui/textarea';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Button } from '../ui/button';

const CommonForm = ({ formControls, buttonText, formData, setFormData, onsubmit, isBtnDisabled }) => {
    function renderInputsByComponentType(controlItem) {
        let element = null;
        const value = formData[controlItem.name] || '';
        switch (controlItem.componentType) {
            case "input":
                element = <Input
                    id={controlItem.name}
                    type={controlItem.type}
                    name={controlItem.name}
                    placeholder={controlItem.placeholder}
                    value={value}
                    onChange={(e) => setFormData({ ...formData, [controlItem.name]: e.target.value })}
                />
                break;
            case "select":
                element = (
                    <Select onValueChange={(value) => setFormData({ ...formData, [controlItem.name]: value })} value={value}>
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder={controlItem.placeholder} />
                        </SelectTrigger>
                        <SelectContent>
                            {
                                controlItem.options && controlItem.options.length > 0 ?
                                    controlItem.options.map(option =>
                                        <SelectItem key={option.id} value={option.id}>
                                            {option.label}
                                        </SelectItem>
                                    ) : null
                            }
                        </SelectContent>
                    </Select>
                );
                break;
            case 'textarea':
                element = <Textarea
                    id={controlItem.id}
                    name={controlItem.name}
                    placeholder={controlItem.placeholder}
                    value={value}
                    onChange={(e) => setFormData({ ...formData, [controlItem.name]: e.target.value })}
                />
                break;

            default: element = <Input
                id={controlItem.name}
                type={controlItem.type}
                name={controlItem.name}
                placeholder={controlItem.placeholder}
                onChange={(e) => setFormData({ ...formData, [controlItem.name]: e.target.value })} />
                break;
        }
        return element;
    }
    return (
        <div>
            <form onSubmit={onsubmit}>
                <div className='flex flex-col gap-3'>
                    {formControls.map((controlItem) => (
                        <div className='grid w-full gap-1.5' key={controlItem.name}>
                            <Label className="mb-1">{controlItem.label}</Label>
                            {renderInputsByComponentType(controlItem)}
                        </div>))
                    }
                </div>
                <Button disabled={isBtnDisabled} type='submit' className='mt-2 w-full'>{buttonText || 'Submit'}</Button>
            </form>
        </div>
    )
}

export default CommonForm
