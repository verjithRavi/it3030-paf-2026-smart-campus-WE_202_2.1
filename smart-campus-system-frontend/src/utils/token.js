export const setToken = (token) => {
  localStorage.setItem('token', token)
}

export const setCurrentUserData = (user) => {
  localStorage.setItem('currentUser', JSON.stringify(user))
}

export const getCurrentUserData = () => {
  const user = localStorage.getItem('currentUser')

  if (!user) {
    return null
  }

  try {
    return JSON.parse(user)
  } catch {
    localStorage.removeItem('currentUser')
    return null
  }
}

export const setAuthSession = (authResponse) => {
  if (authResponse?.token) {
    setToken(authResponse.token)
  }

  setCurrentUserData(authResponse)
}

export const getToken = () => {
  return localStorage.getItem('token')
}

export const removeToken = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('currentUser')
}

export const hasToken = () => {
  return Boolean(getToken())
}
