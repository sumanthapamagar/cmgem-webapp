export interface MSGraphUser {
  id: string;
  displayName: string;
  givenName?: string;
  surname?: string;
  mail?: string;
  userPrincipalName: string;
  jobTitle?: string;
  department?: string;
  companyName?: string;
  officeLocation?: string;
  mobilePhone?: string;
  businessPhones?: string[];
  preferredLanguage?: string;
  country?: string;
  state?: string;
  city?: string;
  streetAddress?: string;
  postalCode?: string;
}

export interface CurrentUser {
  id: string;
  name: string;
  email?: string;
  upn: string;
  jobTitle?: string;
  department?: string;
  company?: string;
  location?: string;
  phone?: string;
  language?: string;
  address?: {
    country?: string;
    state?: string;
    city?: string;
    street?: string;
    postalCode?: string;
  };
}


export interface UserInfo {
  name: string;
  email: string;
  id?: string;
}