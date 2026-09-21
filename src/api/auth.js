import api from './axios'

export const authApi = {
  login: (email, password) =>
    api.post('/login', { email, password }),

  logout: () =>
    api.post('/logout'),

  me: () =>
    api.get('/me'),

  changePassword: (password, password_confirmation) =>
    api.post('/changer-mot-de-passe', { password, password_confirmation }),

  motDePasseOublie: (email) =>
    api.post('/mot-de-passe-oublie', { email }),
}