import { getPosts, uploadImage, addPost, likePost } from "./api.js";
import { renderAddPostPageComponent } from "./components/add-post-page-component.js";
import { renderAuthPageComponent } from "./components/auth-page-component.js";
import {
  ADD_POSTS_PAGE,
  AUTH_PAGE,
  LOADING_PAGE,
  POSTS_PAGE,
  USER_POSTS_PAGE,
} from "./routes.js";
import { renderPostsPageComponent } from "./components/posts-page-component.js";
import { renderLoadingPageComponent } from "./components/loading-page-component.js";
import {
  getUserFromLocalStorage,
  removeUserFromLocalStorage,
  saveUserToLocalStorage,
} from "./helpers.js";

// ===== РЕЗЕРВНЫЕ ДАННЫЕ: включаются, если API недоступен =====
const mockPosts = [
  {
    id: 1,
    createdAt: Date.now(),
    description: "Тестовый пост (мок)",
    imageUrl: "./assets/images/post1.jpg",
    user: {
      id: 1,
      name: "Admin",
      imageUrl: "./assets/images/avatar1.jpg",
    },
    likes: [],
  },
  {
    id: 2,
    createdAt: Date.now() - 86400000,
    description: "Второй тестовый пост (мок)",
    imageUrl: "./assets/images/post2.jpg",
    user: {
      id: 2,
      name: "Пользователь",
      imageUrl: "./assets/images/avatar2.jpg",
    },
    likes: [],
  },
];

const loadPosts = ({ token }) => {
  return getPosts({ token }).catch((error) => {
    console.warn("API недоступен, показываю мок-данные:", error.message);
    return mockPosts;
  });
};

export let user = getUserFromLocalStorage();
export let page = null;
export let posts = [];

const getToken = () => {
  const token = user ? `Bearer ${user.token}` : undefined;
  return token;
};

export const logout = () => {
  user = null;
  removeUserFromLocalStorage();
  goToPage(POSTS_PAGE);
};

export const goToPage = (newPage, data) => {
  if (
    [
      POSTS_PAGE,
      AUTH_PAGE,
      ADD_POSTS_PAGE,
      USER_POSTS_PAGE,
      LOADING_PAGE,
    ].includes(newPage)
  ) {
    if (newPage === ADD_POSTS_PAGE) {
      /* Если пользователь не авторизован, то отправляем его на страницу авторизации перед добавлением поста */
      page = user ? ADD_POSTS_PAGE : AUTH_PAGE;
      return renderApp();
    }

    if (newPage === POSTS_PAGE) {
      page = LOADING_PAGE;
      renderApp();

      return loadPosts({ token: getToken() })
        .then((newPosts) => {
          page = POSTS_PAGE;
          posts = newPosts;
          renderApp();
        })
        .catch((error) => {
          console.error(error);
          goToPage(POSTS_PAGE);
        });
    }

    if (newPage === USER_POSTS_PAGE) {
      // @@TODO: реализую получение постов юзера из API
      console.log("Открываю страницу пользователя: ", data.userId);
      page = USER_POSTS_PAGE;
      posts = [];
      return renderApp();
    }

    page = newPage;
    renderApp();

    return;
  }

  throw new Error("страницы не существует");
};

const renderApp = () => {
  const appEl = document.getElementById("app");
  if (page === LOADING_PAGE) {
    return renderLoadingPageComponent({
      appEl,
      user,
      goToPage,
    });
  }

  if (page === AUTH_PAGE) {
    return renderAuthPageComponent({
      appEl,
      setUser: (newUser) => {
        user = newUser;
        saveUserToLocalStorage(user);
        goToPage(POSTS_PAGE);
      },
      user,
      goToPage,
    });
  }

  if (page === ADD_POSTS_PAGE) {
    return renderAddPostPageComponent({
      appEl,
      user,
      goToPage,
      onAddPostClick({ description, file }) {
        if (!file || !description) {
          alert("Добавьте фото и описание");
          return;
        }

        page = LOADING_PAGE;
        renderApp();

        uploadImage({ file })
          .then((data) => {
            return addPost({
              description,
              imageUrl: data.fileUrl,
              token: getToken(),
            });
          })
          .then(() => {
            goToPage(POSTS_PAGE);
          })
          .catch((error) => {
            console.error(error);
            alert(error.message);
            page = ADD_POSTS_PAGE;
            renderApp();
          });
      },
    });
  }

  if (page === POSTS_PAGE) {
    return renderPostsPageComponent({
      appEl,
      posts,
      user,
      goToPage,
      onLikeClick({ postId }) {
        if (!user) {
          alert("Чтобы лайкать, нужно войти");
          return;
        }

        likePost({ postId, token: getToken() })
          .then(() => {
            // после ответа сервера перезагружаем посты
            goToPage(POSTS_PAGE);
          })
          .catch((error) => {
            console.error(error);
            alert(error.message);
          });
      },
    });
  }

  if (page === USER_POSTS_PAGE) {
    // @TODO: реализовать страницу с фотографиями отдельного пользвателя
    appEl.innerHTML = "Здесь будет страница фотографий пользователя";
    return;
  }
};

goToPage(POSTS_PAGE);