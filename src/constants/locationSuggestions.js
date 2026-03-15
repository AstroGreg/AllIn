export const CITY_OPTIONS = [
    { city: 'Brussels', postalCode: '1000', countryCode: 'BE' },
    { city: 'Antwerp', postalCode: '2000', countryCode: 'BE' },
    { city: 'Ghent', postalCode: '9000', countryCode: 'BE' },
    { city: 'Bruges', postalCode: '8000', countryCode: 'BE' },
    { city: 'Leuven', postalCode: '3000', countryCode: 'BE' },
    { city: 'Hasselt', postalCode: '3500', countryCode: 'BE' },
    { city: 'Liege', postalCode: '4000', countryCode: 'BE' },
    { city: 'Namur', postalCode: '5000', countryCode: 'BE' },
    { city: 'Charleroi', postalCode: '6000', countryCode: 'BE' },
    { city: 'Mechelen', postalCode: '2800', countryCode: 'BE' },
    { city: 'Mons', postalCode: '7000', countryCode: 'BE' },
    { city: 'Kortrijk', postalCode: '8500', countryCode: 'BE' },
    { city: 'Aalst', postalCode: '9300', countryCode: 'BE' },
    { city: 'Ostend', postalCode: '8400', countryCode: 'BE' },
    { city: 'Genk', postalCode: '3600', countryCode: 'BE' },
    { city: 'Sint-Niklaas', postalCode: '9100', countryCode: 'BE' },
    { city: 'Roeselare', postalCode: '8800', countryCode: 'BE' },
    { city: 'Turnhout', postalCode: '2300', countryCode: 'BE' },
    { city: 'Tournai', postalCode: '7500', countryCode: 'BE' },
    { city: 'Waterloo', postalCode: '1410', countryCode: 'BE' },
    { city: 'Diepenbeek', postalCode: '3590', countryCode: 'BE' },
    { city: 'Merksem', postalCode: '2170', countryCode: 'BE' },
    { city: 'Amsterdam', postalCode: '1012', countryCode: 'NL' },
    { city: 'Rotterdam', postalCode: '3011', countryCode: 'NL' },
    { city: 'Utrecht', postalCode: '3511', countryCode: 'NL' },
    { city: 'Eindhoven', postalCode: '5611', countryCode: 'NL' },
    { city: 'Paris', postalCode: '75001', countryCode: 'FR' },
    { city: 'Lille', postalCode: '59000', countryCode: 'FR' },
    { city: 'London', postalCode: 'WC2N', countryCode: 'GB' },
    { city: 'Berlin', postalCode: '10115', countryCode: 'DE' },
    { city: 'Cologne', postalCode: '50667', countryCode: 'DE' },
    { city: 'Luxembourg', postalCode: '1118', countryCode: 'LU' },
];
export const formatCityLabel = (option) => {
    const postalPart = option.postalCode ? ` ${option.postalCode}` : '';
    return `${option.city}${postalPart} (${option.countryCode})`;
};
export const getFilteredCityOptions = (queryLike, limit = 8) => {
    const query = String(queryLike || '').trim().toLowerCase();
    if (!query) {
        return [];
    }
    return CITY_OPTIONS
        .map((option) => ({
        option,
        label: formatCityLabel(option),
    }))
        .filter(({ option, label }) => {
        const city = option.city.toLowerCase();
        const country = option.countryCode.toLowerCase();
        const postalCode = String(option.postalCode || '').toLowerCase();
        const normalizedLabel = label.toLowerCase();
        return (city.includes(query) ||
            postalCode.includes(query) ||
            country.includes(query) ||
            normalizedLabel.includes(query));
    })
        .sort((a, b) => {
        const aStarts = a.option.city.toLowerCase().startsWith(query) ? 0 : 1;
        const bStarts = b.option.city.toLowerCase().startsWith(query) ? 0 : 1;
        if (aStarts !== bStarts) {
            return aStarts - bStarts;
        }
        return a.label.localeCompare(b.label);
    })
        .slice(0, limit);
};
