import { USER_POSTS_PAGE } from "../routes.js";
import { renderHeaderComponent } from "./header-component.js";

// Простая форматировка даты без внешних библиотек:
// "только что", "5 минут назад", "3 часа назад", "2 дня назад"
export function formatDistanceToNow(dateMs) {
  if (!dateMs || isNaN(dateMs)) return "Дата не указана";
  const diff = Math.floor((Date.now() - dateMs) / 1000);
  if (diff < 60) return "только что";
  if (diff < 3600) {
    const m = Math.floor(diff / 60);
    return `${m} ${m === 1 ? "минуту" : m < 5 ? "минуты" : "минут"} назад`;
  }
  if (diff < 86400) {
    const h = Math.floor(diff / 3600);
    return `${h} ${h === 1 ? "час" : h < 5 ? "часа" : "часов"} назад`;
  }
  const d = Math.floor(diff / 86400);
  return `${d} ${d === 1 ? "день" : d < 5 ? "дня" : "дней"} назад`;
}

export function renderPostsPageComponent({ appEl, posts, user, goToPage, onLikeClick }) {
  const postsHtml = posts
    .map((post) => {
      const likesCount = (post.likes || []).length;
      const isLiked =
        post.isLiked ??
        (post.likes || []).some((likeUser) => likeUser.id === user?.id);
      const likeIcon = isLiked
        ? "./assets/images/like-active.svg"
        : "./assets/images/like-not-active.svg";

      return `
        <li class="post" data-post-id="${post.id}">
          <div class="post-header" data-user-id="${post.user.id}">
            <img src="${post.user.imageUrl}" class="post-header__user-image"
                 onerror="this.onerror=null; this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22%3E%3Crect fill=%22%23e0e0e0%22 width=%22100%22 height=%22100%22/%3E%3C/svg%3E';">
            <p class="post-header__user-name">${post.user.name}</p>
          </div>
          <div class="post-image-container">
            <img class="post-image" src="${post.imageUrl}"
                 onerror="this.onerror=null; this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 800 600%22%3E%3Crect fill=%22%23e0e0e0%22 width=%22800%22 height=%22600%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22 fill=%22%23555%22 font-family=%22Arial%22 font-size=%2224%22>Не удалось загрузить изображение%3C/text%3E%3C/svg%3E';">
          </div>
          <div class="post-likes">
            <button data-post-id="${post.id}" class="like-button">
              <img src="${likeIcon}">
            </button>
            <p class="post-likes-text">
              Нравится: <strong>${likesCount}</strong>
            </p>
          </div>
          <p class="post-text">
            <span class="user-name">${post.user.name}</span>
            ${post.description}
          </p>
          <p class="post-date">
            ${formatDistanceToNow(post.createdAt)}
          </p>
        </li>`;
    })
    .join("");

  const appHtml = `
    <div class="page-container">
      <div class="header-container"></div>
      <ul class="posts">${postsHtml}</ul>
    </div>`;

  appEl.innerHTML = appHtml;

  renderHeaderComponent({
    element: document.querySelector(".header-container"),
    user,
    goToPage,
  });

  // Клик по шапке поста — переход на страницу пользователя
  for (let userEl of document.querySelectorAll(".post-header")) {
    userEl.addEventListener("click", () => {
      goToPage(USER_POSTS_PAGE, {
        userId: userEl.dataset.userId,
      });
    });
  }

  // Клик по лайку — передаём postId наверх, в index.js
  for (let likeButton of document.querySelectorAll(".like-button")) {
    likeButton.addEventListener("click", () => {
      onLikeClick({ postId: likeButton.dataset.postId });
    });
  }
}