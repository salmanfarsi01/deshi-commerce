import { apiClient, ApiResponse, wrapSuccess, simulateDelay } from '../baseClient';
import {
  getUsers,
  getCurrentUser,
  setCurrentUser,
  clearCurrentUser,
  updateUserProfile,
} from '../dbStorage';
import { User } from '../../types';

export const authService = {
  sendRegistrationOtp: async (payload: {
    phone: string;
    name?: string;
  }): Promise<ApiResponse<{ phone: string; message: string; demoOtp?: string }>> => {
    try {
      const response = await apiClient.post<ApiResponse<any>>('/auth/register/send-otp', payload);
      if (response.data && response.data.success) {
        return response.data;
      }
    } catch (err: any) {
      if (err.response?.data?.message) {
        throw new Error(err.response.data.message);
      }
    }

    // Standalone Sandbox Fallback
    await simulateDelay(80);
    const cleanPhone = payload.phone.replace(/[^0-9]/g, '');
    const demoOtp = '123456';
    localStorage.setItem(`reg_otp_${cleanPhone}`, demoOtp);
    return wrapSuccess(
      {
        phone: payload.phone,
        message: `Verification code dispatched to ${payload.phone}`,
        demoOtp,
      },
      `OTP sent to ${payload.phone}`
    );
  },

  login: async (credentials: { identifier: string; password?: string }): Promise<
    ApiResponse<{ user: User; accessToken: string; refreshToken: string }>
  > => {
    try {
      const response = await apiClient.post<ApiResponse<any>>('/auth/login', {
        identifier: credentials.identifier,
        password: credentials.password || 'Password123!',
      });
      if (response.data && response.data.success) {
        const { user: backendUser, accessToken, refreshToken } = response.data.data;
        if (accessToken) localStorage.setItem('accessToken', accessToken);
        if (refreshToken) localStorage.setItem('refreshToken', refreshToken);

        const loggedInUser: User = {
          id: backendUser.id,
          name: backendUser.name,
          phone: backendUser.phone,
          email: backendUser.email,
          role: backendUser.role,
          avatarUrl:
            backendUser.avatarUrl ||
            `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(backendUser.name)}`,
          createdAt: backendUser.createdAt || new Date().toISOString(),
        };

        const users = getUsers();
        const existingIdx = users.findIndex((u) => u.id === loggedInUser.id || u.phone === loggedInUser.phone);
        if (existingIdx >= 0) {
          users[existingIdx] = { ...users[existingIdx], ...loggedInUser };
        } else {
          users.push(loggedInUser);
        }
        localStorage.setItem('deshi_users_v1', JSON.stringify(users));
        localStorage.setItem('deshi_current_user_id_v1', loggedInUser.id);

        return wrapSuccess(
          { user: loggedInUser, accessToken, refreshToken },
          `Welcome back, ${loggedInUser.name}!`
        );
      }
    } catch (err: any) {
      if (err.response?.data?.message) {
        throw new Error(err.response.data.message);
      }
    }

    // Standalone Sandbox Fallback
    await simulateDelay(80);
    const users = getUsers();
    const matched =
      users.find(
        (u) =>
          u.email.toLowerCase() === credentials.identifier.toLowerCase() ||
          u.phone.replace(/\s+/g, '') === credentials.identifier.replace(/\s+/g, '')
      ) || users[0];

    setCurrentUser(matched.id);
    const token =
      matched.role === 'ADMIN'
        ? 'mock-jwt-admin-token-deshi-9988'
        : 'mock-jwt-customer-token-deshi-8921';
    const refreshToken =
      matched.role === 'ADMIN'
        ? 'mock-refresh-admin-token-deshi-7766'
        : 'mock-refresh-customer-token-deshi-4912';

    localStorage.setItem('accessToken', token);
    localStorage.setItem('refreshToken', refreshToken);

    return wrapSuccess(
      {
        user: matched,
        accessToken: token,
        refreshToken,
      },
      `Welcome back, ${matched.name}!`
    );
  },

  adminLogin: async (credentials: { identifier: string; password?: string }): Promise<
    ApiResponse<{ user: User; accessToken: string; refreshToken: string }>
  > => {
    try {
      const response = await apiClient.post<ApiResponse<any>>('/auth/login', {
        identifier: credentials.identifier,
        password: credentials.password || 'Password123!',
      });
      if (response.data && response.data.success) {
        const { user: backendUser, accessToken, refreshToken } = response.data.data;
        if (backendUser.role !== 'ADMIN') {
          throw new Error('Access denied. Administrator privileges required.');
        }
        if (accessToken) localStorage.setItem('accessToken', accessToken);
        if (refreshToken) localStorage.setItem('refreshToken', refreshToken);

        const adminUser: User = {
          id: backendUser.id,
          name: backendUser.name,
          phone: backendUser.phone,
          email: backendUser.email,
          role: 'ADMIN',
          avatarUrl:
            backendUser.avatarUrl ||
            `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(backendUser.name)}`,
          createdAt: backendUser.createdAt || new Date().toISOString(),
        };

        const users = getUsers();
        const existingIdx = users.findIndex((u) => u.id === adminUser.id || u.phone === adminUser.phone);
        if (existingIdx >= 0) {
          users[existingIdx] = { ...users[existingIdx], ...adminUser };
        } else {
          users.push(adminUser);
        }
        localStorage.setItem('deshi_users_v1', JSON.stringify(users));
        localStorage.setItem('deshi_current_user_id_v1', adminUser.id);

        return wrapSuccess(
          { user: adminUser, accessToken, refreshToken },
          `Admin login successful. Welcome, ${adminUser.name}!`
        );
      }
    } catch (err: any) {
      if (err.response?.data?.message) {
        throw new Error(err.response.data.message);
      }
      if (err.message && err.message.toLowerCase().includes('administrator privileges required')) {
        throw err;
      }
    }

    // Standalone Sandbox Fallback
    await simulateDelay(80);
    const cleanIdentifier = (credentials.identifier || '').trim().toLowerCase();
    const cleanPhone = (credentials.identifier || '').replace(/\s+/g, '');
    const users = getUsers();

    const matchedAdmin = users.find(
      (u) =>
        u.role === 'ADMIN' &&
        (u.email.toLowerCase() === cleanIdentifier || u.phone.replace(/\s+/g, '') === cleanPhone)
    );

    const isKnownAdmin =
      Boolean(matchedAdmin) ||
      cleanIdentifier === 'admin@store.com.bd' ||
      cleanIdentifier === 'admin@deshicommerce.com.bd' ||
      cleanIdentifier.includes('admin') ||
      cleanPhone === '01711111111';

    if (!isKnownAdmin) {
      throw new Error('Access denied. No administrator account found matching this identifier.');
    }

    const pass = (credentials.password || '').trim();
    const allowedPass = ['password123!', 'admin', 'admin123', '123456', '12345678', 'password'];
    if (pass && !allowedPass.includes(pass.toLowerCase()) && !isKnownAdmin) {
      throw new Error('Invalid administrator password. Access denied.');
    }

    const admin = matchedAdmin || setCurrentUser('usr_admin_01');
    setCurrentUser(admin.id);
    return wrapSuccess(
      {
        user: admin,
        accessToken: 'mock-jwt-admin-token-deshi-9988',
        refreshToken: 'mock-refresh-admin-token-deshi-7766',
      },
      `Welcome to Executive Portal, ${admin.name}!`
    );
  },

  register: async (payload: {
    name: string;
    phone: string;
    email?: string;
    password?: string;
    otp?: string;
  }): Promise<ApiResponse<{ user: User; accessToken: string; refreshToken: string }>> => {
    try {
      const response = await apiClient.post<ApiResponse<any>>('/auth/register', payload);
      if (response.data && response.data.success) {
        const { user: backendUser, accessToken, refreshToken } = response.data.data;
        if (accessToken) localStorage.setItem('accessToken', accessToken);
        if (refreshToken) localStorage.setItem('refreshToken', refreshToken);

        const registeredUser: User = {
          id: backendUser.id,
          name: backendUser.name,
          phone: backendUser.phone,
          email: backendUser.email,
          role: backendUser.role,
          avatarUrl:
            backendUser.avatarUrl ||
            `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(backendUser.name)}`,
          createdAt: backendUser.createdAt || new Date().toISOString(),
        };

        const users = getUsers();
        users.push(registeredUser);
        localStorage.setItem('deshi_users_v1', JSON.stringify(users));
        localStorage.setItem('deshi_current_user_id_v1', registeredUser.id);

        return wrapSuccess(
          { user: registeredUser, accessToken, refreshToken },
          'Account created successfully!'
        );
      }
    } catch (err: any) {
      if (err.response?.data?.message) {
        throw new Error(err.response.data.message);
      }
    }

    // Standalone Sandbox Fallback
    await simulateDelay(100);
    const cleanPhone = payload.phone.replace(/[^0-9]/g, '');
    const storedOtp = localStorage.getItem(`reg_otp_${cleanPhone}`);
    if (storedOtp && payload.otp && payload.otp.trim() !== storedOtp && payload.otp.trim() !== '123456') {
      throw new Error('Invalid verification code (OTP). Please check SMS.');
    }
    localStorage.removeItem(`reg_otp_${cleanPhone}`);

    const users = getUsers();
    const newUser: User = {
      id: `usr_new_${Date.now()}`,
      name: payload.name,
      phone: payload.phone,
      email: payload.email || `${payload.phone}@deshicommerce.com.bd`,
      role: 'CUSTOMER',
      avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(payload.name)}`,
      createdAt: new Date().toISOString(),
    };
    users.push(newUser);
    localStorage.setItem('deshi_users_v1', JSON.stringify(users));

    setCurrentUser(newUser.id);
    const accessToken = `mock-jwt-new-user-${newUser.id}`;
    const refreshToken = `mock-refresh-new-user-${newUser.id}`;

    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);

    return wrapSuccess({ user: newUser, accessToken, refreshToken }, 'Account created successfully!');
  },

  googleAuth: async (payload: {
    email: string;
    name: string;
    avatarUrl?: string;
    googleId?: string;
    isSignUp?: boolean;
  }): Promise<ApiResponse<{ user: User; accessToken: string; refreshToken: string }>> => {
    await simulateDelay(80);
    const users = getUsers();
    let user = users.find((u) => u.email.toLowerCase() === payload.email.toLowerCase());

    if (!user) {
      const newUser: User = {
        id: `usr_google_${Date.now()}`,
        name: payload.name || payload.email.split('@')[0],
        phone: '017' + Math.floor(10000000 + Math.random() * 90000000),
        email: payload.email,
        role: 'CUSTOMER',
        avatarUrl:
          payload.avatarUrl ||
          `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(payload.name || payload.email)}`,
        authProvider: 'google',
        googleId: payload.googleId || `gid_${Date.now()}`,
        createdAt: new Date().toISOString(),
      };
      users.push(newUser);
      localStorage.setItem('deshi_users_v1', JSON.stringify(users));
      user = newUser;
    } else {
      user.authProvider = 'google';
      if (payload.avatarUrl) user.avatarUrl = payload.avatarUrl;
      if (payload.name && !user.name) user.name = payload.name;
      localStorage.setItem('deshi_users_v1', JSON.stringify(users));
    }

    setCurrentUser(user.id);
    const accessToken = `mock-jwt-google-${user.id}`;
    const refreshToken = `mock-refresh-google-${user.id}`;
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);

    return wrapSuccess(
      { user, accessToken, refreshToken },
      payload.isSignUp
        ? `Welcome to Deshi commerce, ${user.name}! Registered with Google Mail.`
        : `Signed in successfully with Google Mail (${user.email})`
    );
  },

  logout: async (): Promise<ApiResponse<{ loggedOut: boolean }>> => {
    try {
      await apiClient.post('/auth/logout');
    } catch {
      // Ignore network errors on logout
    }
    clearCurrentUser();
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    return wrapSuccess({ loggedOut: true }, 'Signed out successfully');
  },

  refresh: async (token: string): Promise<ApiResponse<{ accessToken: string; refreshToken: string }>> => {
    try {
      const res = await apiClient.post<ApiResponse<any>>('/auth/refresh', { refreshToken: token });
      if (res.data?.data) return res.data;
    } catch {
      // Fallback
    }
    await simulateDelay(40);
    const newAccessToken = `mock-refreshed-jwt-${Date.now()}`;
    const newRefreshToken = `mock-refreshed-refresh-${Date.now()}`;
    return wrapSuccess({ accessToken: newAccessToken, refreshToken: newRefreshToken });
  },

  getProfile: async (): Promise<ApiResponse<User | null>> => {
    try {
      const res = await apiClient.get<ApiResponse<any>>('/users/me');
      if (res.data?.data) {
        const u = res.data.data;
        const user: User = {
          id: u.id,
          name: u.name,
          email: u.email,
          phone: u.phone,
          role: u.role,
          avatarUrl: u.avatarUrl,
          gender: u.gender,
          age: u.age,
          createdAt: u.createdAt || new Date().toISOString(),
        };
        return wrapSuccess(user);
      }
    } catch {
      // Fallback
    }
    await simulateDelay(40);
    return wrapSuccess(getCurrentUser());
  },

  updateProfile: async (data: Partial<User>): Promise<ApiResponse<User>> => {
    try {
      const res = await apiClient.patch<ApiResponse<any>>('/users/me', data);
      if (res.data?.data) {
        const u = res.data.data;
        const user: User = {
          id: u.id,
          name: u.name,
          email: u.email,
          phone: u.phone,
          role: u.role,
          avatarUrl: u.avatarUrl,
          gender: u.gender,
          age: u.age,
          createdAt: u.createdAt || new Date().toISOString(),
        };
        updateUserProfile(user.id, user);
        return wrapSuccess(user, 'Profile updated successfully');
      }
    } catch {
      // Fallback
    }
    await simulateDelay(60);
    const current = getCurrentUser();
    if (!current) throw new Error('Not authenticated');
    const updated = updateUserProfile(current.id, data);
    return wrapSuccess(updated, 'Profile updated successfully');
  },

  switchDemoUser: async (role: 'CUSTOMER' | 'ADMIN'): Promise<ApiResponse<User>> => {
    if (role === 'ADMIN') {
      try {
        const res = await authService.adminLogin({
          identifier: 'admin@store.com.bd',
          password: 'Password123!',
        });
        return wrapSuccess(res.data.user, `Switched session to ${res.data.user.name} (ADMIN)`);
      } catch {
        // fallback
      }
    } else {
      try {
        const res = await authService.login({
          identifier: '01722222222',
          password: 'Password123!',
        });
        return wrapSuccess(res.data.user, `Switched session to ${res.data.user.name} (CUSTOMER)`);
      } catch {
        // fallback
      }
    }
    await simulateDelay(40);
    const users = getUsers();
    const target = users.find((u) => u.role === role) || users[0];
    const user = setCurrentUser(target.id);
    return wrapSuccess(user, `Switched session to ${user.name} (${user.role})`);
  },

  changePassword: async (oldPass: string, newPass: string): Promise<ApiResponse<{ updated: boolean }>> => {
    try {
      const res = await apiClient.patch('/users/me/password', {
        oldPassword: oldPass,
        newPassword: newPass,
      });
      if (res.data) return wrapSuccess({ updated: true }, 'Password changed successfully');
    } catch (err: any) {
      if (err.response?.data?.message) throw new Error(err.response.data.message);
    }
    await simulateDelay(80);
    return wrapSuccess({ updated: true }, 'Password changed successfully');
  },

  forgotPassword: async (identifier: string): Promise<ApiResponse<{ message: string; otp?: string }>> => {
    try {
      const res = await apiClient.post<ApiResponse<any>>('/auth/forgot-password', {
        identifier,
      });
      if (res.data?.data) return res.data;
    } catch (err: any) {
      if (err.response?.data?.message) throw new Error(err.response.data.message);
    }
    await simulateDelay(80);
    return wrapSuccess({
      message: `Reset OTP sent to ${identifier}`,
      otp: '123456',
    });
  },

  resetPassword: async (otp: string, newPass: string): Promise<ApiResponse<{ reset: boolean }>> => {
    try {
      const res = await apiClient.post('/auth/reset-password', {
        phone: '',
        otp,
        newPassword: newPass,
      });
      if (res.data) return wrapSuccess({ reset: true }, 'Password successfully reset');
    } catch (err: any) {
      if (err.response?.data?.message) throw new Error(err.response.data.message);
    }
    await simulateDelay(80);
    return wrapSuccess({ reset: true }, 'Password successfully reset');
  },
};
