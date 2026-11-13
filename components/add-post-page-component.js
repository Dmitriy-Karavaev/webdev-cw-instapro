import { renderHeaderComponent } from "./header-component.js";

export function renderAddPostPageComponent({ appEl, onAddPostClick, user, goToPage }) {
  let selectedFile = null;
  let previewUrl = "";

  const render = () => {
    appEl.innerHTML = `
      <div class="page-container">
        <div class="header-container"></div>
        <div class="add-post-form">
          <div class="add-post-title">Добавить пост</div>
          <div class="add-post-form-row">
            <label class="file-upload-label secondary-button">
              <input type="file" class="file-input" hidden accept="image/*">
              ${selectedFile ? "Заменить фото" : "Выберите фото"}
            </label>
            <div class="file-upload-image-container">
              ${previewUrl
                ? `<img class="file-upload-image" src="${previewUrl}">`
                : ""}
            </div>
          </div>
          <div class="add-post-form-row">
            Описание фотографии:
            <textarea class="textarea" rows="4" placeholder="Опишите фото..."></textarea>
          </div>
          <button class="button add-post-button">
            ${selectedFile ? "Добавить" : "Выберите фото и добавьте пост"}
          </button>
        </div>
      </div>`;

    renderHeaderComponent({
      element: appEl.querySelector(".header-container"),
      user,
      goToPage,
    });

    const fileInput = appEl.querySelector(".file-input");
    const textarea = appEl.querySelector(".textarea");
    const button = appEl.querySelector(".add-post-button");

    fileInput.addEventListener("change", () => {
      const file = fileInput.files[0];
      if (!file) return;

      selectedFile = file;

      const reader = new FileReader();
      reader.onload = () => {
        previewUrl = reader.result;
        render();
      };
      reader.readAsDataURL(file);
    });

    button.addEventListener("click", () => {
      onAddPostClick({
        description: textarea.value,
        file: selectedFile,
      });
    });
  };

  render();
}