import React, { useState } from 'react';

const Filters = () => {
    const [selectedCategories, setSelectedCategories] = useState(['Vegetables']);
    const [priceRange, setPriceRange] = useState([0, 100]);
    const [selectedSellerTypes, setSelectedSellerTypes] = useState([]);
    const [selectedAvailability, setSelectedAvailability] = useState([]);
    const [selectedCertifications, setSelectedCertifications] = useState(['Organic Certified']);

    const categories = [
        { label: 'Vegetables', count: 847 },
        { label: 'Fruits', count: 234 },
        { label: 'Herbs', count: 89 },
        { label: 'Seeds', count: 77 }
    ];

    const sellerTypes = [
        { label: 'Local Farms', count: 456 },
        { label: 'Certified Organic', count: 234 },
        { label: 'Wholesale', count: 123 }
    ];

    const availability = [
        { label: 'In Stock', count: 1156 },
        { label: 'Pre-order', count: 91 }
    ];

    const certifications = [
        { label: 'Organic Certified', count: 789 },
        { label: 'Non-GMO', count: 567 },
        { label: 'Fair Trade', count: 234 }
    ];

    const handleCheckboxChange = (value, selectedList, setSelectedList) => {
        if (selectedList.includes(value)) {
            setSelectedList(selectedList.filter(item => item !== value));
        } else {
            setSelectedList([...selectedList, value]);
        }
    };

    const handlePriceChange = (e) => {
        const value = parseInt(e.target.value);
        setPriceRange([0, value]);
    };

    return (
        <div className="bg-gray-50 p-6 border-r border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800 mb-6">Filters</h2>

            {/* Category Section */}
            <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Category</h3>
                <div className="space-y-2">
                    {categories.map((category, idx) => (
                        <label key={idx} className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={selectedCategories.includes(category.label)}
                                onChange={() => handleCheckboxChange(category.label, selectedCategories, setSelectedCategories)}
                                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-700">
                                {category.label} ({category.count})
                            </span>
                        </label>
                    ))}
                </div>
            </div>

            {/* Price Range Section */}
            <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Price Range</h3>
                <div className="grid grid-cols-2 gap-2 mb-3">
                    <input
                        type="text"
                        placeholder="Min"
                        value={priceRange[0]}
                        readOnly
                        className="px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    />
                    <input
                        type="text"
                        placeholder="Max"
                        value={priceRange[1]}
                        readOnly
                        className="px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    />
                </div>
                <input
                    type="range"
                    min="0"
                    max="100"
                    value={priceRange[1]}
                    onChange={handlePriceChange}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-slate-700"
                />
                <div className="flex justify-between mt-2">
                    <span className="text-xs text-gray-600">$0</span>
                    <span className="text-xs text-gray-600">$100+</span>
                </div>
            </div>

            {/* Seller Type Section */}
            <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Seller Type</h3>
                <div className="space-y-2">
                    {sellerTypes.map((type, idx) => (
                        <label key={idx} className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={selectedSellerTypes.includes(type.label)}
                                onChange={() => handleCheckboxChange(type.label, selectedSellerTypes, setSelectedSellerTypes)}
                                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-700">
                                {type.label} ({type.count})
                            </span>
                        </label>
                    ))}
                </div>
            </div>

            {/* Availability Section */}
            <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Availability</h3>
                <div className="space-y-2">
                    {availability.map((avail, idx) => (
                        <label key={idx} className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={selectedAvailability.includes(avail.label)}
                                onChange={() => handleCheckboxChange(avail.label, selectedAvailability, setSelectedAvailability)}
                                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-700">
                                {avail.label} ({avail.count})
                            </span>
                        </label>
                    ))}
                </div>
            </div>

            {/* Certification Section */}
            <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Certification</h3>
                <div className="space-y-2">
                    {certifications.map((cert, idx) => (
                        <label key={idx} className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={selectedCertifications.includes(cert.label)}
                                onChange={() => handleCheckboxChange(cert.label, selectedCertifications, setSelectedCertifications)}
                                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-700">
                                {cert.label} ({cert.count})
                            </span>
                        </label>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Filters;