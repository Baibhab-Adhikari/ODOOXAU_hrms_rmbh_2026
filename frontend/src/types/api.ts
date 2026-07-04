export type TokenResponse = {
  access_token: string;
  token_type: string;
  must_reset_password?: boolean;
};

export type MeResponse = {
  id: string;
  email: string;
  role: "employee" | "hr";
  full_name: string;
  is_active: boolean;
};
