import { ExportData, Variant } from '../types';

const escapeCsvField = (field: string | number | null | undefined): string => {
    if (field === null || field === undefined) {
        return '';
    }
    const stringField = String(field);
    if (stringField.includes(',') || stringField.includes('"') || stringField.includes('\n')) {
        return `"${stringField.replace(/"/g, '""')}"`;
    }
    return stringField;
};

export const exportToShopifyCsv = (data: ExportData) => {
    const { seoContent, compareAtPrice, selectedVariants } = data;

    // --- FIX: De-duplicate variants to prevent Shopify import error ---
    const uniqueVariantsMap = new Map<string, Variant>();
    selectedVariants.forEach(variant => {
        const key = `${variant.finish.trim()}|${variant.color.trim()}`;
        if (!uniqueVariantsMap.has(key)) {
            uniqueVariantsMap.set(key, variant);
        }
    });
    const uniqueVariants = Array.from(uniqueVariantsMap.values());
    // --- End of FIX ---

    const headers = [
        'Handle', 'Title', 'Body (HTML)', 'Vendor', 'Product Category', 'Type', 'Tags', 'Published',
        'Option1 Name', 'Option1 Value', 'Option2 Name', 'Option2 Value', 'Option3 Name', 'Option3 Value',
        'Variant SKU', 'Variant Grams', 'Variant Inventory Tracker', 'Variant Inventory Policy',
        'Variant Fulfillment Service', 'Variant Price', 'Variant Compare At Price',
        'Variant Requires Shipping', 'Variant Taxable', 'Status'
    ];
    
    const modifiedTitle = `${seoContent.title} | 3D Printed In Multiple Color Options`;
    
    const disclaimer = '<p>🌱 Each piece is uniquely crafted from eco-friendly materials using precision 3D printing. This process may result in slight textural variations, adding to the individual charm of every item.</p><p>💡 Please note: Accessories shown are for display purposes only and are not included.</p>';
    const modifiedDescription = `${seoContent.description}${disclaimer}`;

    const handle = modifiedTitle.toLowerCase()
        .replace(/[^\w\s-]/g, '') // remove special chars
        .replace(/\s+/g, '-')    // replace spaces with hyphens
        .slice(0, 70);           // truncate for safety

    if (uniqueVariants.length === 0) {
        alert("No unique variants selected. Please select at least one variant to export.");
        return;
    }

    const rows: string[][] = [];

    uniqueVariants.forEach((variant, index) => {
        let rowData: (string | number | null | undefined)[];
        if (index === 0) {
            // First row: This is the main product definition.
            rowData = [
                handle,
                modifiedTitle,
                modifiedDescription,
                '', // Vendor
                '', // Product Category
                '', // Type
                seoContent.tags.join(', '),
                'TRUE', // Published
                'Finish', // Option1 Name
                variant.finish, // Option1 Value
                'Color', // Option2 Name
                variant.color, // Option2 Value
                '', '', // Option3
                '', // SKU
                '', // Grams
                '', // Inventory Tracker
                'deny', // Inventory Policy
                'manual', // Fulfillment Service
                variant.price,
                compareAtPrice,
                'TRUE', // Requires Shipping
                'TRUE', // Taxable
                'active', // Status
            ];
        } else {
            // Subsequent rows: These define the other variants.
            // Most fields are blank, only handle and variant-specific fields are filled.
            rowData = [
                handle,
                '', '', '', '', '', '', '', // Empty product fields
                '', // Option1 Name
                variant.finish, // Option1 Value
                '', // Option2 Name
                variant.color, // Option2 Value
                '', '', // Option3
                '', '', '', 'deny', 'manual',
                variant.price,
                compareAtPrice,
                'TRUE', 'TRUE', 'active'
            ];
        }
        rows.push(rowData.map(escapeCsvField));
    });

    const csvContent = [
        headers.join(','),
        ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `${handle}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
};
