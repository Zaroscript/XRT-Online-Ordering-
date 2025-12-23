import {
  AuthResponse,
  LoginInput,
  RegisterInput,
  User,
  ChangePasswordInput,
  ForgetPasswordInput,
  VerifyForgetPasswordTokenInput,
  ResetPasswordInput,
  MakeAdminInput,
  BlockUserInput,
  WalletPointsInput,
  UpdateUser,
  QueryOptionsType,
  UserPaginator,
  UserQueryOptions,
  VendorQueryOptionsType,
  KeyInput,
  LicensedDomainPaginator,
  LicenseAdditionalData,
} from '@/types';
import { API_ENDPOINTS } from './api-endpoints';
import { HttpClient } from './http-client';

export const userClient = {
  me: () => {
    return HttpClient.get<User>(API_ENDPOINTS.ME);
  },
  login: (variables: LoginInput) => {
    return HttpClient.post<AuthResponse>(API_ENDPOINTS.LOGIN, variables);
  },
  logout: () => {
    return HttpClient.post<any>(API_ENDPOINTS.LOGOUT, {});
  },
  register: (variables: RegisterInput) => {
    return HttpClient.post<AuthResponse>(API_ENDPOINTS.REGISTER, variables);
  },
  createUser: (variables: RegisterInput) => {
    return HttpClient.post<User>(API_ENDPOINTS.USERS, variables);
  },
  update: ({ id, input }: { id: string; input: UpdateUser }) => {
    return HttpClient.patch<User>(`${API_ENDPOINTS.USERS}/${id}`, input);
  },
  changePassword: (variables: ChangePasswordInput) => {
    return HttpClient.patch<any>(API_ENDPOINTS.CHANGE_PASSWORD, variables);
  },
  forgetPassword: (variables: ForgetPasswordInput) => {
    return HttpClient.post<any>(API_ENDPOINTS.FORGET_PASSWORD, variables);
  },
  verifyForgetPasswordToken: (variables: VerifyForgetPasswordTokenInput) => {
    return HttpClient.post<any>(
      API_ENDPOINTS.VERIFY_FORGET_PASSWORD_TOKEN,
      variables,
    );
  },
  resetPassword: (
    variables: ResetPasswordInput & { token: string; email: string },
  ) => {
    return HttpClient.post<any>(API_ENDPOINTS.RESET_PASSWORD, {
      email: variables.email,
      otp: variables.token,
      password: variables.password,
    });
  },
  makeAdmin: (variables: MakeAdminInput & { id: string }) => {
    return HttpClient.patch<any>(
      API_ENDPOINTS.USER_APPROVE.replace(':id', variables.id),
      variables,
    );
  },
  block: (variables: BlockUserInput) => {
    return HttpClient.patch<any>(
      API_ENDPOINTS.USER_BAN.replace(':id', String(variables.id)),
      variables,
    );
  },
  unblock: (variables: BlockUserInput) => {
    return HttpClient.patch<any>(
      API_ENDPOINTS.USER_BAN.replace(':id', String(variables.id)),
      { ...variables, ban: false },
    );
  },
  addWalletPoints: (variables: WalletPointsInput) => {
    return HttpClient.post<any>(API_ENDPOINTS.ADD_WALLET_POINTS, variables);
  },
  addLicenseKey: (variables: KeyInput) => {
    return HttpClient.post<any>(
      API_ENDPOINTS.ADD_LICENSE_KEY_VERIFY,
      variables,
    );
  },

  fetchUsers: ({ name, ...params }: Partial<UserQueryOptions>) => {
    return HttpClient.get<UserPaginator>(API_ENDPOINTS.USERS, {
      searchJoin: 'and',
      ...params,
      search: HttpClient.formatSearchParams({ name }),
    });
  },
  fetchAdmins: ({ ...params }: Partial<UserQueryOptions>) => {
    return HttpClient.get<UserPaginator>(API_ENDPOINTS.USERS, {
      searchJoin: 'and',
      role: 'admin',
      ...params,
    });
  },
  fetchUser: ({ id }: { id: string }) => {
    return HttpClient.get<User>(`${API_ENDPOINTS.USERS}/${id}`);
  },
  resendVerificationEmail: () => {
    return HttpClient.post<any>(API_ENDPOINTS.SEND_VERIFICATION_EMAIL, {});
  },
  updateEmail: ({ email }: { email: string }) => {
    return HttpClient.patch<any>(API_ENDPOINTS.UPDATE_EMAIL, { email });
  },
  fetchVendors: ({ is_active, ...params }: Partial<UserQueryOptions>) => {
    return HttpClient.get<UserPaginator>(API_ENDPOINTS.USERS, {
      searchJoin: 'and',
      role: 'vendor',
      is_active,
      ...params,
    });
  },
  fetchCustomers: ({ ...params }: Partial<UserQueryOptions>) => {
    return HttpClient.get<UserPaginator>(API_ENDPOINTS.USERS, {
      searchJoin: 'and',
      role: 'client',
      ...params,
    });
  },
  getMyStaffs: ({
    is_active,
    shop_id,
    name,
    ...params
  }: Partial<UserQueryOptions & { shop_id: string }>) => {
    // Temporarily disabled - not implemented in customize_server yet
    return Promise.resolve({
      current_page: 1,
      first_page_url: '',
      from: 0,
      last_page: 1,
      last_page_url: '',
      links: [],
      next_page_url: null,
      path: '',
      per_page: 10,
      prev_page_url: null,
      to: 0,
      total: 0,
      data: [],
    });
  },
  getAllStaffs: ({ is_active, name, ...params }: Partial<UserQueryOptions>) => {
    // Temporarily disabled - not implemented in customize_server yet
    return Promise.resolve({
      current_page: 1,
      first_page_url: '',
      from: 0,
      last_page: 1,
      last_page_url: '',
      links: [],
      next_page_url: null,
      path: '',
      per_page: 10,
      prev_page_url: null,
      to: 0,
      total: 0,
      data: [],
    });
  },
};
