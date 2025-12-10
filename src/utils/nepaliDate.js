// Simple AD to BS converter for Nepali dates
const nepaliMonths = [
  'बैशाख', 'जेठ', 'आषाढ', 'श्रावण', 'भाद्र', 'आश्विन',
  'कार्तिक', 'मंसिर', 'पौष', 'माघ', 'फाल्गुन', 'चैत्र'
];

export const convertToNepaliDate = (adDate) => {
  try {
    if (!adDate) return 'N/A';
    
    const date = new Date(adDate);
    if (isNaN(date.getTime())) return 'Invalid Date';
    
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    
    // Convert AD to BS (Bikram Sambat)
    let bsYear = year + 56;
    let bsMonth = month + 9;
    let bsDay = day;
    
    // Handle month overflow
    if (bsMonth > 12) {
      bsMonth -= 12;
      bsYear += 1;
    }
    
    // Adjust for mid-April start of Nepali year
    if (month < 4 || (month === 4 && day < 14)) {
      bsYear -= 1;
    }
    
    // Ensure valid ranges
    if (bsDay > 32) bsDay = 32;
    if (bsMonth < 1) bsMonth = 1;
    if (bsMonth > 12) bsMonth = 12;
    
    return `${bsYear}/${String(bsMonth).padStart(2, '0')}/${String(bsDay).padStart(2, '0')}`;
  } catch (error) {
    console.error('Date conversion error:', error);
    return new Date(adDate).toLocaleDateString();
  }
};

export const formatNepaliDate = (adDate) => {
  try {
    const date = new Date(adDate);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    
    // Simple BS conversion
    let bsYear = year + 57;
    let bsMonth = month + 8;
    let bsDay = day;
    
    if (bsMonth > 12) {
      bsMonth -= 12;
      bsYear += 1;
    }
    
    if (bsDay > 30) bsDay = 30;
    
    const nepaliMonthName = nepaliMonths[bsMonth - 1] || nepaliMonths[0];
    
    return `${bsDay} ${nepaliMonthName}, ${bsYear}`;
  } catch (error) {
    return new Date(adDate).toLocaleDateString();
  }
};