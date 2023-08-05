import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import { PixabayAPI } from './api';
import 'simplelightbox/dist/simple-lightbox.min.css';


const searchForm = document.querySelector('#search-form');
const gallery = document.querySelector('.gallery');

const lightbox = new SimpleLightbox('.gallery a');
const pixabayAPI = new PixabayAPI();

searchForm.addEventListener('submit', handleFormSubmit);

function handleFormSubmit(event) {
  event.preventDefault();
  const searchInput = searchForm.querySelector('[name="searchQuery"]');
  const query = searchInput.value.trim();
  
  if (query === '') {
    return;
  }
  
  pixabayAPI.q = query;
  pixabayAPI.page = 1;
  gallery.innerHTML = '';
  
  fetchImages();
}

async function fetchImages() {
  try {
    const response = await pixabayAPI.fetchImgs();
    const imagesData = response.data.hits;
    
    if (imagesData.length === 0) {
      Notiflix.Notify.failure('Sorry, there are no images matching your search query. Please try again.');
      return;
    }

    imagesData.forEach(imageData => {
      const card = createImageCard(imageData);
      gallery.appendChild(card);
    });

    Notiflix.Notify.success(`Hooray! We found ${response.data.totalHits} images.`);
    
    lightbox.refresh();
    smoothScrollToGallery();
  } catch (error) {
    console.error('Error fetching images:', error);
    Notiflix.Notify.failure('Oops! Something went wrong while fetching images.');
  }
}

function createImageCard(imageData) {
  const template = document.createElement('template');
  template.innerHTML = `
    <div class="photo-card">
      <a class="gallery-link" href="${imageData.largeImageURL}">
        <img src="${imageData.webformatURL}" alt="${imageData.tags}" loading="lazy" />
      </a>
      <div class="info">
        <p class="info-item">
          <b>Likes</b>
          ${imageData.likes}
        </p>
        <p class="info-item">
          <b>Views</b>
          ${imageData.views}
        </p>
        <p class="info-item">
          <b>Comments</b>
          ${imageData.comments}
        </p>
        <p class="info-item">
          <b>Downloads</b>
          ${imageData.downloads}
        </p>
      </div>
    </div>
  `;

  return template.content.firstElementChild;
}

function smoothScrollToGallery() {
  const { height: cardHeight } = document.querySelector(".gallery").firstElementChild.getBoundingClientRect();
  window.scrollBy({
    top: cardHeight * 2,
    behavior: "smooth",
  });
}
