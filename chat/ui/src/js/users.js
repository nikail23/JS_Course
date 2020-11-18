const UsersModele = (function () {
  class User {
    constructor(name, avatar) {
      this.name = name;
      this.avatar = avatar;
    }
  }

  class UserList {
    constructor(users, activeUsers) {
      this.users = users;
      this.activeUsers = activeUsers;
    }
  }

  const users = [
    new User('User1', 'https://image.flaticon.com/icons/png/512/194/194938.png'),
    new User('User2', 'https://cdn.iconscout.com/icon/free/png-256/avatar-370-456322.png'),
    new User('User3', 'https://cdn.iconscout.com/icon/free/png-256/avatar-380-456332.png'),
    new User('User4', 'https://cdn.iconscout.com/icon/free/png-256/avatar-372-456324.png'),
  ];
  const activeUsers = [
    new User('User1', 'https://image.flaticon.com/icons/png/512/194/194938.png'),
    new User('User2', 'https://cdn.iconscout.com/icon/free/png-256/avatar-370-456322.png'),
    new User('User3', 'https://cdn.iconscout.com/icon/free/png-256/avatar-380-456332.png'),
  ];

  const userList = new UserList(users, activeUsers);

  return {
    UserList,
    User,
    userList,
  };
}());

const UsersView = (function () {
  class ActiveUsersView {
    constructor(containerId) {
      this.containerId = containerId;
    }

    display(params) {
      // eslint-disable-next-line no-undef
      const container = document.getElementById(this.containerId);
      container.innerHTML = params;
    }
  }

  const activeUsersView = new ActiveUsersView('usersList');

  return {
    ActiveUsersView,
    activeUsersView,
  };
}());

function showActiveUsers() {
  let activeUsersHTML = '';
  UsersModele.userList.activeUsers.forEach((activeUser) => {
    activeUsersHTML
    += `<div class="user">
        <img src="${activeUser.avatar}" alt="">
        ${activeUser.name}
    </div>`;
  });

  UsersView.activeUsersView.display(activeUsersHTML);
}

showActiveUsers();
