export interface UserAddress {
  street: string;
  city: string;
  postalCode: string;
  country: string;
}

export interface UserSpecializedProfile {
  aboutMe: string;
  additionalPhones: string[];
  additionalEmails: string[];
  niches: string[];
}

export interface UserProfile {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  bday?: string;
  pfp?: string;
  address?: Partial<UserAddress>;
  fieldsOfInterest?: string[];
  specializedProfile?: Partial<UserSpecializedProfile>;
}

export interface MeResponse {
  logged: boolean;
  user: UserProfile;
  message?: string;
}

export interface UpdateProfileMetadata {
  changeAdd: boolean;
  naddress?: UserAddress;

  changePass: boolean;
  npassword?: string;

  changeFOI: boolean;
  nfieldsOfInterest?: string[];
}

export interface UpdateProfilePayload {
  metadata: UpdateProfileMetadata;
  pfp?: File | null;
  folder?: string;
}

export interface ApiMessageResponse {
  message: string;
}