// Generate a random account number
export function generateAccountNumber(): string {
  // 10-digit account number
  return Math.floor(1000000000 + Math.random() * 9000000000).toString();
}

// Generate IBAN (International Bank Account Number)
export function generateIBAN(countryCode: string = 'US'): string {
  const bankCode = 'AMAL';
  const branchCode = '001';
  const accountNumber = generateAccountNumber();
  return `${countryCode}00${bankCode}${branchCode}${accountNumber}`;
}

// Generate account name from user's full name
export function generateAccountName(firstName: string, lastName: string): string {
  return `${firstName} ${lastName}`.toUpperCase();
}

// Generate other bank credentials
export function generateBankCredentials(firstName: string, lastName: string) {
  return {
    accountNumber: generateAccountNumber(),
    iban: generateIBAN(),
    accountName: generateAccountName(firstName, lastName),
    routingNumber: '021000021', // Sample routing number for Amalgamated Bank
    swiftCode: 'AMALUS33', // Sample SWIFT/BIC code
    accountType: 'Checking', // Default account type
    currency: 'USD', // Default currency
    openingDate: new Date().toISOString().split('T')[0],
  };
}