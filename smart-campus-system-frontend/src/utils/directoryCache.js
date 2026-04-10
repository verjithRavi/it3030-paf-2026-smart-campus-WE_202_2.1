const directoryCache = {
  admins: [],
  students: [],
  lecturers: [],
  technicians: [],
};

function cloneUsers(users = []) {
  return users.map((user) => ({ ...user }));
}

function getCategoryForUser(user) {
  if (user?.role === 'ADMIN') {
    return 'admins';
  }

  if (user?.role === 'TECHNICIAN') {
    return 'technicians';
  }

  if (user?.userType === 'STUDENT') {
    return 'students';
  }

  if (user?.userType === 'LECTURER') {
    return 'lecturers';
  }

  return null;
}

export function getDirectoryCache(category) {
  return cloneUsers(directoryCache[category]);
}

export function setDirectoryCache(category, users) {
  directoryCache[category] = cloneUsers(users);
}

export function upsertCachedUser(user) {
  const targetCategory = getCategoryForUser(user);

  Object.keys(directoryCache).forEach((category) => {
    directoryCache[category] = directoryCache[category].filter(
      (entry) => entry.id !== user.id
    );
  });

  if (!targetCategory) {
    return;
  }

  directoryCache[targetCategory] = [user, ...directoryCache[targetCategory]];
}

export function replaceCachedUser(user) {
  const targetCategory = getCategoryForUser(user);

  Object.keys(directoryCache).forEach((category) => {
    directoryCache[category] = directoryCache[category].filter(
      (entry) => entry.id !== user.id
    );
  });

  if (!targetCategory) {
    return;
  }

  const existingIndex = directoryCache[targetCategory].findIndex(
    (entry) => entry.id === user.id
  );

  if (existingIndex === -1) {
    directoryCache[targetCategory] = [user, ...directoryCache[targetCategory]];
    return;
  }

  directoryCache[targetCategory][existingIndex] = {
    ...directoryCache[targetCategory][existingIndex],
    ...user,
  };
}

export function removeCachedUser(userId) {
  Object.keys(directoryCache).forEach((category) => {
    directoryCache[category] = directoryCache[category].filter(
      (entry) => entry.id !== userId
    );
  });
}
