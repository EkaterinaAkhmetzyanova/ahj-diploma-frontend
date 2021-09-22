/* eslint-disable import/no-unresolved */
/* eslint-disable consistent-return */
/* eslint-disable no-restricted-syntax */
/* eslint-disable guard-for-in */
/* eslint-disable class-methods-use-this */
/* eslint-disable max-len */
/* eslint-disable no-console */
import { saveAs } from 'file-saver';
import { Array } from 'core-js';
import Geolocation from './Geolocation';
import sendFile from './sendFile';

export default class Widget {
  constructor(url) {
    this.url = url;
    this.geolocation = new Geolocation();
    this.ws = new WebSocket(this.url);
    this.msgContainer = document.querySelector('.chaos-messages');
    this.form = document.querySelector('.chaos-form');
    this.fileInput = document.querySelector('.chaos-input-file');
    this.textInput = document.querySelector('.chaos-input');
    this.searchContainer = document.querySelector('.chaos-search-container');
    this.clip = document.querySelector('.chaos-clip-icon');
    this.geoBtn = document.querySelector('.chaos-geo-icon');
    this.media = document.querySelector('.media-list');

    this.searchBtn = document.querySelector('.chaos-search-icon');
    this.favoritesBtn = Array.from(document.querySelectorAll('.chaos-fav-icon'));
    this.dnd = document.querySelector('.dnd-area');
    this.dndWrapper = document.querySelector('.dnd-box');

    this.onLoad = this.onLoad.bind(this);
    this.getMessage = this.getMessage.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
    this.uploadFile = this.uploadFile.bind(this);
    this.sendMsg = this.sendMsg.bind(this);
    this.createLink = this.createLink.bind(this);
    this.sendLocation = this.sendLocation.bind(this);
    this.findMessage = this.findMessage.bind(this);
    this.createCategory = this.createCategory.bind(this);
    this.selectCategory = this.selectCategory.bind(this);
    this.showCategories = this.showCategories.bind(this);
    this.dragDrop = this.dragDrop.bind(this);
  }

  init() {
    this.ws.addEventListener('open', (event) => {
      // event.preventDefault();
      this.onLoad(event);
    });
    this.ws.addEventListener('message', (event) => {
      this.serverCommands(event);
    });
    this.ws.addEventListener('close', (e) => {
      console.log(`Ошибка соединения - ${e.code} - ${e.reason}`);
    });
    this.ws.addEventListener('error', (e) => {
      console.log(`Ошибка соединения - ${e.code} - ${e.reason}`);
    });
    this.form.addEventListener('submit', (event) => {
      this.onSubmit(event);
    });
    this.clip.addEventListener('click', () => {
      this.fileInput.dispatchEvent(new MouseEvent('click'));
    });
    this.fileInput.addEventListener('change', () => {
      //   const files = Array.from(event.dataTransfer.files);
      //   files.forEach((item) => {
      //       this.uploadFile(item);
      //   })

      //  const files = Array.from(this.fileInput.files);
      // const file = files[0];
      this.uploadFile();
    });
    this.searchBtn.addEventListener('click', this.findMessage);
    this.msgContainer.addEventListener('wheel', (event) => {
      if (event.deltaY < 0 && window.scrollY === 0) {
        this.sendMsg(JSON.stringify({ command: 'loadLatest' }));
      }
    });
    // this.msgContainer.addEventListener('scroll', () => {
    //     this.sendMsg(JSON.stringify({command: 'loadLatest'}));
    // })
    this.dnd.addEventListener('drop', (event) => {
      event.preventDefault();
      console.log('drop');
      this.dragDrop(event);
    });
    this.dnd.addEventListener('dragover', (event) => {
      event.preventDefault();
      console.log('dragover');
    });
    this.msgContainer.addEventListener('dragover', (event) => {
      event.preventDefault();
      this.dragDrop(event);
    });
    this.geoBtn.addEventListener('click', () => {
      this.sendLocation();
    });
    this.media.addEventListener('click', (event) => {
      this.selectCategory(event);
    });
  }

  onLoad() {
    this.sendMsg(JSON.stringify({ command: 'loadLatest' }));
  }

  serverCommands(event) {
    const item = JSON.parse(event.data);
    console.log(item);
    if (item.command === 'loadLatest') {
      item.data.forEach((el) => {
        this.msgContainer.insertAdjacentElement('beforeend', this.getMessage(el));
      });
    } else if (item.command === 'newMessage' || item.command === 'sendGeo') {
      this.msgContainer.insertAdjacentElement('afterbegin', this.getMessage(item.data));
    } else if (item.command === 'msgSearch') {
      item.data.forEach((el) => {
        this.msgContainer.insertAdjacentElement('afterbegin', this.getMessage(el));
      });
    } else if (item.command === 'getCategory') {
      item.data.forEach((el) => {
        this.msgContainer.insertAdjacentElement('afterbegin', this.getMessage(el));
      });
    } else if (item.command === 'categoriesNum') {
      this.showCategories(item.data);
    }
  }

  uploadFile() {
    //  if (!file) {
    //     return;
    // }
    // console.log(file);
    // const reader = new FileReader();
    // reader.readAsDataURL(file);
    // reader.addEventListener('load', () => {
    //     const data = {
    //     message: file.name,
    //     file: reader.result,
    //     type: file.type,
    //     name: file.name,
    //     };
    //     console.log(data);
    sendFile(this.fileInput.files[0], this.url);
    // });
  }

  sendMsg(message) {
    this.ws.send(message);
  }

  onSubmit(event) {
    event.preventDefault();
    if (this.textInput.value === '') {
      return;
    }
    const data = {
      command: 'newMessage',
      message: this.textInput.value,
    };
    this.ws.send(JSON.stringify(data));
    this.textInput.value = '';
  }

  getMessage(element) {
    const message = document.createElement('div');
    message.className = 'chaos-message';
    const href = this.url.replace('ws', 'http');
    if (element.type === 'file') {
      const linkEl = document.createElement('div');
      linkEl.className = 'chaos-file';
      const text = element.message;
      linkEl.innerHTML = `
              <a href="${href}${text}">${text}</a>;
            `;
      message.insertAdjacentElement('beforeend', linkEl);
      linkEl.addEventListener('click', (event) => {
        event.preventDefault();
        saveAs(`${href}${text}`, text);
      });
    } else if (element.type === 'image') {
      const imgEl = document.createElement('img');
      imgEl.className = 'chaos-img';
      imgEl.src = `${href}${element.message}`;
      message.insertAdjacentElement('beforeend', imgEl);
    } else if (element.type === 'video') {
      const videoEl = document.createElement('video');
      videoEl.className = 'chaos-video';
      videoEl.src = `${href}${element.message}`;
      console.log(element);
      videoEl.controls = 'controls';
      videoEl.textContent = element.message;
      message.insertAdjacentElement('beforeend', videoEl);
    } else if (element.type === 'audio') {
      const audioEl = document.createElement('audio');
      audioEl.className = 'chaos-audio';
      audioEl.src = `${href}${element.message}`;
      console.log(element);
      audioEl.controls = 'controls';
      audioEl.textContent = element.message;
      message.insertAdjacentElement('beforeend', audioEl);
    } else {
      const text = document.createElement('p');
      text.className = 'chaos-link-text';
      message.insertAdjacentElement('beforeend', text);
      const link = this.createLink(element.message);
      if (link !== false) {
        text.innerHTML = link;
      } else {
        text.textContent = element.message;
      }
    }

    const header = document.createElement('div');
    header.className = 'message-header';
    header.innerHTML = `
       <button class="chaos-fav-icon"></button>
       <div class="created">${element.created}</div>
     `;
    message.insertAdjacentElement('afterbegin', header);
    return message;
  }

  createLink(string) {
    if (string === null || !string) {
      return string;
    }
    // const reg = string.match(/((http:\/\/|https:\/\/){1}(www)?([\da-z.-]+)\.([a-z.]{2,6})([/\w.-?%#&-]*)*\/?)/gi);
    // if (!reg) {
    //     return false;
    // }
    // let link = string;
    //     reg.forEach((item) => {
    //     console.log(item);
    //     const formattedLink = `<a href="${item}">${item}</a>`;
    //     link = string.replace(new RegExp(item, 'g'), formattedLink);
    //     });
    // return link;
    const links = string.replace(/((http:\/\/|https:\/\/){1}(www)?([\da-z.-]+)\.([a-z.]{2,6})([/\w.-?%#&-]*)*\/?)/gi, '<a href="$1">$1</a>');
    return links;
  }

  dragDrop(event) {
    event.preventDefault();
    if (event.type === 'dragover') {
      this.dndWrapper.classList.remove('hidden');
      return;
    }
    if (event.type === 'drop') {
      this.dndWrapper.classList.add('hidden');
      const files = Array.from(event.dataTransfer.files);
      files.forEach((item) => {
        sendFile(item, this.url);
      });
    }
    if (event.type === 'dragleave') {
      this.dndWrapper.classList.add('hidden');
    }
  }

  sendLocation() {
    this.geolocation.getGeoPermission().then((resolve) => {
      this.sendMsg(JSON.stringify({ command: 'sendGeo', message: resolve }));
    });
  }

  createCategory(type, amount) {
    const category = document.createElement('li');
    category.className = 'media-category';
    category.innerHTML = `
        <a class="category-link" href='#' data-id="${type}">${type} (${amount})</a>
      `;
    return category;
  }

  selectCategory(event) {
    if (event.target.classList.contains('category-link')) {
      this.msgContainer.innerHTML = '';
      this.ws.send(JSON.stringify({ command: 'getCategory', data: event.target.dataset.id }));
    }
  }

  showCategories(item) {
    this.media.innerHTML = '';
    for (const type in item) {
      this.media.insertAdjacentElement('afterbegin', this.createCategory(type, item[type]));
    }
  }

  // addFavorite(event) {
  //    const icon = event.target.closest('.chaos-fav-icon');
  //    console.log(icon);
  //    icon.addEventListener('click', () => {
  //      const post = icon.closest('.chaos-message');
  //    })
  // }

  createSearchForm() {
    const searchForm = document.createElement('form');
    searchForm.className = 'search-form';
    searchForm.innerHTML = `
          <input type="text" class="search-input">
        `;
    searchForm.insertAdjacentElement('beforeend', this.searchBtn);
    this.searchContainer.insertAdjacentElement('afterbegin', searchForm);
  }

  findMessage(event) {
    event.preventDefault();
    this.createSearchForm();
    this.searchInput = document.querySelector('.search-input');
    this.searchBtn.classList.add('hidden');

    this.searchInput.addEventListener('input', () => {
      this.msgContainer.innerHTML = '';
      this.sendMsg(JSON.stringify({ command: 'msgSearch', message: this.searchInput.value }));
    });
    this.searchContainer.addEventListener('click', (e) => {
      if (e.target === this.searchBtn) {
        return false;
      }
      if (event.target !== this.searchInput) {
        this.searchInput.remove();
        this.searchBtn.classList.remove('hidden');
      }
    });
  }
}
