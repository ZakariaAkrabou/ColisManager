declare module 'react-phone-input-2' {
  import * as React from 'react';
  type CountryData = { countryCode?: string; dialCode?: string; name?: string } & Record<string, any>;
  interface PhoneInputProps {
    country?: string;
    value?: string;
    onChange?: (value: string, country?: CountryData, e?: React.ChangeEvent<HTMLInputElement>, formattedValue?: string) => void;
    inputClass?: string;
    buttonClass?: string;
    containerClass?: string;
    dropdownClass?: string;
    enableSearch?: boolean;
    preferredCountries?: string[];
    [key: string]: any;
  }
  const PhoneInput: React.ComponentType<PhoneInputProps>;
  export default PhoneInput;
}
