export type TokenResponse = {
  access_token: string;
  token_type: string;
  actor_type: string;
  must_reset_password: boolean;
};

export type MeResponse = {
  id: string;
  full_name: string;
  email: string;
  actor_type: string;
};
