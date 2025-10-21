
import React from 'react';
import { FinishGroup } from '../types';
import { Icon } from './Icon';
import { Button } from './Button';

interface VariantSelectorProps {
    basePrice: number;
    onBasePriceChange: (price: number) => void;
    compareAtPrice: number | null;
    onCompareAtPriceChange: (price: number | null) => void;
    finishGroups: FinishGroup[];
    onVariantChange: (groups: FinishGroup[]) => void;
    onAddCustomOption: (groupName: string, optionName: string) => void;
}

const PriceInput: React.FC<{ label: string, value: number | null, onChange: (val: number | null) => void }> = ({ label, value, onChange }) => (
    <div className="relative">
        <label htmlFor={label} className="block text-sm font-medium text-gray-700">{label}</label>
        <div className="mt-1 relative rounded-lg shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">$</span>
            </div>
            <input
                type="number"
                id={label}
                className="focus:ring-primary-accent focus:border-primary-accent block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-lg"
                placeholder="0.00"
                value={value ?? ''}
                onChange={(e) => {
                    const val = e.target.value;
                    onChange(val === '' ? null : parseFloat(val));
                }}
            />
        </div>
    </div>
);

export const VariantSelector: React.FC<VariantSelectorProps> = ({
    basePrice, onBasePriceChange, compareAtPrice, onCompareAtPriceChange,
    finishGroups, onVariantChange, onAddCustomOption
}) => {
    const [newCustomOptionName, setNewCustomOptionName] = React.useState(''); // For adding options to existing groups
    const [newGroupName, setNewGroupName] = React.useState(''); // For adding new variant groups

    const toggleGroupOpen = (id: string) => {
        onVariantChange(finishGroups.map(g => g.id === id ? { ...g, open: !g.open } : g));
    };

    const handlePriceModifierChange = (id: string, modifier: number) => {
        onVariantChange(finishGroups.map(g => g.id === id ? { ...g, priceModifier: isNaN(modifier) ? 0 : modifier } : g));
    };

    const handleSelectAllGroup = (id: string, select: boolean) => {
        onVariantChange(finishGroups.map(g =>
            g.id === id ? { ...g, options: g.options.map(o => ({ ...o, selected: select })) } : g
        ));
    };

    const handleOptionToggle = (groupId: string, optionName: string) => {
        onVariantChange(finishGroups.map(g =>
            g.id === groupId ? { ...g, options: g.options.map(o => o.name === optionName ? { ...o, selected: !o.selected } : o) } : g
        ));
    };

    const handleSelectAllVariants = (e: React.ChangeEvent<HTMLInputElement>) => {
        const isChecked = e.target.checked;
        onVariantChange(finishGroups.map(g => ({ ...g, options: g.options.map(o => ({ ...o, selected: isChecked })) })));
    };
    
    const allSelected = finishGroups.every(g => g.options.every(o => o.selected));

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <PriceInput label="Base Price" value={basePrice} onChange={(val) => onBasePriceChange(val ?? 0)} />
                <PriceInput label="Compare At Price (Optional)" value={compareAtPrice} onChange={onCompareAtPriceChange} />
            </div>
            <div className="flex items-center">
                <input id="select-all" type="checkbox" checked={allSelected} onChange={handleSelectAllVariants} className="h-4 w-4 text-primary-accent focus:ring-primary-accent border-gray-300 rounded" />
                <label htmlFor="select-all" className="ml-2 block text-sm text-gray-900">Select All Variants</label>
            </div>

            <div className="mt-6 border-t border-gray-200 pt-6">
                <label htmlFor="new-variant-group-name" className="block text-sm font-medium text-gray-700 mb-2">Add New Variant Group (e.g., "Accent Color")</label>
                <div className="flex gap-2">
                    <input
                        type="text"
                        id="new-variant-group-name"
                        value={newGroupName}
                        onChange={(e) => setNewGroupName(e.target.value)}
                        className="flex-1 block w-full rounded-lg border-gray-300 shadow-sm focus:ring-primary-accent focus:border-primary-accent sm:text-sm p-2"
                        placeholder="Enter new group name"
                    />
                    <Button 
                        onClick={() => {
                            if (newGroupName.trim()) {
                                onAddCustomOption('new_group', newGroupName.trim()); // Use a special group name to signal new group creation
                                setNewGroupName('');
                            }
                        }}
                        variant="secondary"
                        size="sm"
                        disabled={!newGroupName.trim()}
                    >
                        Add Group
                    </Button>
                </div>
            </div>

            <div className="space-y-2 mt-6">
                {finishGroups.map(group => {
                    const selectedCount = group.options.filter(o => o.selected).length;
                    const allInGroupSelected = selectedCount === group.options.length;
                    return (
                        <div key={group.id} className="border border-gray-200 rounded-lg">
                            <div className="flex items-center p-3 bg-violet-50/50 cursor-pointer" onClick={() => toggleGroupOpen(group.id)}>
                                <input type="checkbox" checked={allInGroupSelected} onChange={(e) => handleSelectAllGroup(group.id, e.target.checked)} onClick={(e) => e.stopPropagation()} className="h-4 w-4 text-primary-accent focus:ring-primary-accent border-gray-300 rounded" />
                                <div className="ml-3 flex-1">
                                    <span className="font-medium text-gray-800">{group.name}</span>
                                    <span className="ml-2 text-sm text-gray-500">({selectedCount} / {group.options.length} selected)</span>
                                </div>
                                <div className="flex items-center">
                                    <span className="text-gray-500 text-sm mr-2">Price: ${ (basePrice + group.priceModifier).toFixed(2) }</span>
                                    <Icon name={group.open ? 'chevron-up' : 'chevron-down'} className="text-gray-500" />
                                </div>
                            </div>
                            {group.open && (
                                <div className="p-4 border-t border-gray-200">
                                    <div className="mb-4">
                                        <label className="text-sm font-medium text-gray-700">Price Modifier</label>
                                        <div className="mt-1 relative rounded-lg shadow-sm">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><span className="text-gray-500 sm:text-sm">$</span></div>
                                            <input type="number" value={group.priceModifier} onChange={(e) => handlePriceModifierChange(group.id, parseFloat(e.target.value))} className="focus:ring-primary-accent focus:border-primary-accent block w-full pl-7 sm:text-sm border-gray-300 rounded-lg"/>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                        {group.options.map(option => (
                                            <div key={option.name} className="flex items-center">
                                                <input id={`${group.id}-${option.name}`} type="checkbox" checked={option.selected} onChange={() => handleOptionToggle(group.id, option.name)} className="h-4 w-4 text-primary-accent focus:ring-primary-accent border-gray-300 rounded" />
                                                <label htmlFor={`${group.id}-${option.name}`} className="ml-2 block text-sm text-gray-700">{option.name}</label>
                                            </div>
                                        ))}
                                    </div>
                                    {group.id === 'gloss' && ( // Only show custom add for 'Gloss' for now
                                        <div className="mt-4 border-t border-gray-200 pt-4">
                                            <label htmlFor="new-custom-color" className="block text-sm font-medium text-gray-700 mb-2">Add Custom Color (e.g., Blue + Grey)</label>
                                            <div className="flex gap-2">
                                                <input
                                                    type="text"
                                                    id="new-custom-color"
                                                    value={newCustomOptionName}
                                                    onChange={(e) => setNewCustomOptionName(e.target.value)}
                                                    className="flex-1 block w-full rounded-lg border-gray-300 shadow-sm focus:ring-primary-accent focus:border-primary-accent sm:text-sm p-2"
                                                    placeholder="Enter new color combination"
                                                />
                                                <Button 
                                                    onClick={() => {
                                                        if (newCustomOptionName.trim()) {
                                                            onAddCustomOption(group.name, newCustomOptionName.trim());
                                                            setNewCustomOptionName('');
                                                        }
                                                    }}
                                                    variant="secondary"
                                                    size="sm"
                                                    disabled={!newCustomOptionName.trim()}
                                                >
                                                    Add
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
